// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {BaseHook} from "v4-periphery/src/base/hooks/BaseHook.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {AgentRegistry} from "./AgentRegistry.sol";
import {YieldVault} from "./YieldVault.sol";
import {ILInsurance} from "./ILInsurance.sol";
/// @title HookMindCore
/// @notice The central Uniswap v4 Hook controlled by autonomous AI agents.
/// @notice Implements: Dynamic Fees + IL Protection + Fee Smoothing + Agent Signal Processing
/// @dev Inherits BaseHook. Uses Nirium's Hub & Spoke architecture adapted to v4.
contract HookMindCore is BaseHook, ReentrancyGuard, Pausable {
    using PoolIdLibrary for PoolKey;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    // ─── State ───────────────────────────────────────────────────────────────
    AgentRegistry public immutable agentRegistry;
    YieldVault    public immutable yieldVault;
    ILInsurance   public immutable ilInsurance;
    address public admin;
    struct PoolIntelligence {
        uint24  targetFeeBps;       // AI-recommended fee (in pips, e.g. 3000 = 0.3%)
        uint256 volatilityScore;    // 0–10000 scale (10000 = max volatility)
        uint256 lastAgentUpdate;    // block.timestamp of last AI signal
        bool    ilProtectionActive; // true = hook triggers hedging on large swaps
        uint256 epochFeesAccrued;   // fees this epoch (for vault smoothing)
    }
    // poolId => intelligence state set by AI agents
    mapping(PoolId => PoolIntelligence) public poolIntelligence;
    // Minimum seconds between AI agent updates per pool (prevents spam)
    uint256 public constant MIN_UPDATE_INTERVAL = 10; // ~10 seconds / ~1 block
    // Dynamic fee boundaries
    uint24 public constant MIN_FEE = 500;      // 0.05%
    uint24 public constant MAX_FEE = 10000;   // 1.00%
    // ─── Events ──────────────────────────────────────────────────────────────
    event AgentSignalProcessed(
        PoolId indexed poolId,
        address indexed agent,
        uint24 newFeeBps,
        uint256 volatilityScore,
        bool ilProtectionActive,
        string ipfsCID
    );
    event ILProtectionTriggered(PoolId indexed poolId, int256 deltaExposure);
    event FeesRouteToVault(PoolId indexed poolId, uint256 amount);
    // ─── Errors ──────────────────────────────────────────────────────────────
    error NotAgentOperator();
    error UpdateTooFrequent();
    error InvalidSignature();
    error InvalidFeeRange();
    error PoolNotRegistered();
    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(
        IPoolManager   _poolManager,
        AgentRegistry  _agentRegistry,
        YieldVault     _yieldVault,
        ILInsurance    _ilInsurance,
        address        _admin
    ) BaseHook(_poolManager) {
        agentRegistry  = _agentRegistry;
        yieldVault     = _yieldVault;
        ilInsurance    = _ilInsurance;
        admin          = _admin;
    }
    // ─── Hook Permissions ────────────────────────────────────────────────────
    /// @notice Declare which hook callbacks this contract implements
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize:         false,
            afterInitialize:          true,  // register pool intelligence state
            beforeAddLiquidity:       false,
            afterAddLiquidity:        true,  // enroll LP in IL insurance
            beforeRemoveLiquidity:    false,
            afterRemoveLiquidity:     true,  // process IL payout on exit
            beforeSwap:               true,  // apply AI-computed dynamic fee
            afterSwap:                true,  // route fees to vault + trigger IL hedge
            beforeDonate:             false,
            afterDonate:              false,
            beforeSwapReturnDelta:    false,
            afterSwapReturnDelta:     false,
            afterAddLiquidityReturnDelta:    false,
            afterRemoveLiquidityReturnDelta: false
        });
    }
    // ─── Hook Callbacks ──────────────────────────────────────────────────────
    /// @notice After pool init: set default intelligence state
    function afterInitialize(
        address,
        PoolKey calldata key,
        uint160,
        int24
    ) external override onlyPoolManager returns (bytes4) {
        PoolId pid = key.toId();
        poolIntelligence[pid] = PoolIntelligence({
            targetFeeBps:       3000,
            volatilityScore:    5000,
            lastAgentUpdate:    block.timestamp,
            ilProtectionActive: true,
            epochFeesAccrued:   0
        });
        return BaseHook.afterInitialize.selector;
    }
    /// @notice Before swap: apply the dynamic fee recommended by the AI agent
    function beforeSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata,
        bytes calldata
    ) external override onlyPoolManager whenNotPaused
      returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId pid      = key.toId();
        PoolIntelligence memory intel = poolIntelligence[pid];
        // Override pool fee with agent-recommended dynamic fee
        uint24 dynamicFee = intel.targetFeeBps;
        return (
            BaseHook.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            dynamicFee | uint24(Hooks.OVERRIDE_FEE_FLAG)
        );
    }
    /// @notice After swap: route accrued fees to YieldVault + optional IL hedge
    function afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata
    ) external override onlyPoolManager nonReentrant
      returns (bytes4, int128) {
        PoolId pid  = key.toId();
        PoolIntelligence storage intel = poolIntelligence[pid];
        // Compute fee amount from swap delta (simplified)
        uint256 feeAmount    = _computeFeeAmount(delta, intel.targetFeeBps);
        intel.epochFeesAccrued += feeAmount;
        // Route fees to vault for epoch-smoothed distribution
        if (feeAmount > 0) {
            emit FeesRouteToVault(pid, feeAmount);
        }
        // IL protection: if swap is large and IL protection is active, signal hedge
        if (intel.ilProtectionActive) {
            int256 ilExposure = _estimateILDelta(delta);
            if (ilExposure > 1e15) { // threshold: 0.001 ETH equivalent
                emit ILProtectionTriggered(pid, ilExposure);
                // Signals indexers (The Graph) to notify agent daemon off-chain
            }
        }
        return (BaseHook.afterSwap.selector, 0);
    }
    /// @notice After add liquidity: enroll LP position in IL insurance
    function afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, BalanceDelta) {
        ilInsurance.enrollLP(sender, key.toId(), uint128(-delta.amount0()));
        return (BaseHook.afterAddLiquidity.selector, delta);
    }
    /// @notice After remove liquidity: calculate and request IL insurance payout
    function afterRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta delta,
        BalanceDelta,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, BalanceDelta) {
        ilInsurance.processExit(sender, key.toId());
        return (BaseHook.afterRemoveLiquidity.selector, delta);
    }
    // ─── Agent Signal Processing (The AI → On-Chain Bridge) ─────────────────
    /// @notice Submit an AI agent signal to update pool intelligence parameters
    /// @dev Called directly by the Node.js agent daemon via viem.
    ///      Signature verification prevents unauthorized parameter manipulation.
    /// @param key          The Uniswap v4 pool to update
    /// @param newFeeBps    AI-recommended dynamic fee (in pips)
    /// @param volatility   AI-computed volatility score 0–10000
    /// @param ilProtect    Whether to activate IL protection this epoch
    /// @param ipfsCID      Pinata IPFS CID of the agent's reasoning log
    /// @param nonce        Agent's current nonce (anti-replay)
    /// @param signature    ECDSA signature by the agent's registered EOA
    function submitAgentSignal(
        PoolKey calldata key,
        uint24  newFeeBps,
        uint256 volatility,
        bool    ilProtect,
        string  calldata ipfsCID,
        uint256 nonce,
        bytes   calldata signature
    ) external nonReentrant whenNotPaused {
        // 1. Verify the caller is a registered active agent
        if (!agentRegistry.hasRole(agentRegistry.AGENT_OPERATOR_ROLE(), msg.sender)) {
            revert NotAgentOperator();
        }
        // 2. Verify nonce to prevent replay attacks
        if (nonce != agentRegistry.nonces(msg.sender)) revert UpdateTooFrequent();
        // 3. Verify fee is within safe bounds
        if (newFeeBps < MIN_FEE || newFeeBps > MAX_FEE) revert InvalidFeeRange();
        // 4. Reconstruct and verify ECDSA signature
        bytes32 msgHash = keccak256(abi.encodePacked(
            key.toId(), newFeeBps, volatility, ilProtect, ipfsCID, nonce, block.chainid
        )).toEthSignedMessageHash();
        address signer = msgHash.recover(signature);
        if (signer != msg.sender) revert InvalidSignature();
        // 5. Apply intelligence update
        PoolId pid = key.toId();
        PoolIntelligence storage intel = poolIntelligence[pid];
        // Rate limit: 1 update per MIN_UPDATE_INTERVAL seconds
        if (block.timestamp - intel.lastAgentUpdate < MIN_UPDATE_INTERVAL) {
            revert UpdateTooFrequent();
        }
        intel.targetFeeBps       = newFeeBps;
        intel.volatilityScore    = volatility;
        intel.ilProtectionActive = ilProtect;
        intel.lastAgentUpdate    = block.timestamp;
        // 6. Record signal on AgentRegistry (updates IPFS CID + nonce)
        agentRegistry.recordSignal(msg.sender, nonce, ipfsCID);
        emit AgentSignalProcessed(pid, msg.sender, newFeeBps, volatility, ilProtect, ipfsCID);
    }
    // ─── Internal Helpers ─────────────────────────────────────────────────────
    function _computeFeeAmount(
        BalanceDelta delta,
        uint24 feeBps
    ) internal pure returns (uint256) {
        uint256 grossSwap = uint256(uint128(
            delta.amount0() < 0 ? -delta.amount0() : delta.amount0()
        ));
        return (grossSwap * feeBps) / 1_000_000;
    }
    function _estimateILDelta(BalanceDelta delta) internal pure returns (int256) {
        return int256(int128(delta.amount0())) + int256(int128(delta.amount1()));
    }
    // ─── Admin ────────────────────────────────────────────────────────────────
    function pause()   external { require(msg.sender == admin); _pause(); }
    function unpause() external { require(msg.sender == admin); _unpause(); }
}
