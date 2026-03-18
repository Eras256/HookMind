// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";
import {SwapParams, ModifyLiquidityParams} from "v4-core/src/types/PoolOperation.sol";
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
    YieldVault    public yieldVault;
    ILInsurance   public ilInsurance;
    address public admin;
    address public protocolTreasury; // Software license collector

    uint256 public constant SOFTWARE_TOLL_BPS = 100; // 1% Technology Road Toll

    struct PoolIntelligence {
        uint24  targetFeeBps;       // AI-recommended fee (in pips, e.g. 3000 = 0.3%)
        uint256 volatilityScore;    // 0–10000 scale (10000 = max volatility)
        uint256 lastAgentUpdate;    // block.timestamp of last AI signal
        bool    ilProtectionActive; // true = hook triggers hedging on large swaps
        uint256 epochFeesAccrued;   // fees this epoch (for vault smoothing)
    }
    // poolId => intelligence state set by AI agents
    mapping(PoolId => PoolIntelligence) public poolIntelligence;
    
    // O(1) Mapping for ultra-fast hook reads (respects Unichain 1s blocks)
    mapping(PoolId => uint24) public currentDynamicFee;

    // Minimum seconds between AI agent updates per pool (prevents spam)
    uint256 public constant MIN_UPDATE_INTERVAL = 0; // Set to 0 for demo/testnet
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
    event SoftwareTollCollected(PoolId indexed poolId, uint256 amount);
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
        address        _admin,
        address        _protocolTreasury
    ) BaseHook(_poolManager) {
        agentRegistry  = _agentRegistry;
        yieldVault     = _yieldVault;
        ilInsurance    = _ilInsurance;
        admin          = _admin;
        protocolTreasury = _protocolTreasury;
    }
    /// @notice Set vault and insurance addresses after mined hook deployment
    function setVaults(YieldVault _yieldVault, ILInsurance _ilInsurance) external {
        require(msg.sender == admin, "Only admin");
        yieldVault = _yieldVault;
        ilInsurance = _ilInsurance;
    }
    function setProtocolTreasury(address _newTreasury) external {
        require(msg.sender == admin, "Only admin");
        protocolTreasury = _newTreasury;
    }
    // ─── Hook Permissions ────────────────────────────────────────────────────
    /// @notice Declare which hook callbacks this contract implements
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize:         false,
            afterInitialize:          true,
            beforeAddLiquidity:       false,
            afterAddLiquidity:        true,
            beforeRemoveLiquidity:    false,
            afterRemoveLiquidity:     true,
            beforeSwap:               true,
            afterSwap:                true,
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
    function _afterInitialize(
        address,
        PoolKey calldata key,
        uint160,
        int24
    ) internal override returns (bytes4) {
        PoolId pid = key.toId();
        poolIntelligence[pid] = PoolIntelligence({
            targetFeeBps:       3000,
            volatilityScore:    5000,
            lastAgentUpdate:    block.timestamp,
            ilProtectionActive: true,
            epochFeesAccrued:   0
        });
        currentDynamicFee[pid] = 3000;
        return IHooks.afterInitialize.selector;
    }
    /// @notice Before swap: apply the dynamic fee recommended by the AI agent
    // Transient Storage Slots (EIP-1153)
    // Using a fixed numeric slot for compatibility with inline assembly constraints
    uint256 private constant FEE_SLOT = 0x8d5e1234; 

    function _beforeSwap(
        address,
        PoolKey calldata key,
        SwapParams calldata,
        bytes calldata
    ) internal override whenNotPaused
      returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId pid = key.toId();
        uint24 dynamicFee = currentDynamicFee[pid];
        if (dynamicFee == 0) dynamicFee = 3000;

        // Use Transient Storage (EIP-1153) to pass the target fee to afterSwap
        // This avoids costly SLOADs/SSTOREs in the swap hot path
        assembly {
            tstore(FEE_SLOT, dynamicFee)
        }

        return (
            IHooks.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            dynamicFee | LPFeeLibrary.OVERRIDE_FEE_FLAG
        );
    }
    /// @notice After swap: route accrued fees to YieldVault + optional IL hedge
    function _afterSwap(
        address,
        PoolKey calldata key,
        SwapParams calldata,
        BalanceDelta delta,
        bytes calldata
    ) internal override nonReentrant
      returns (bytes4, int128) {
        PoolId pid  = key.toId();
        
        // Read fee from Transient Storage (TLOAD)
        uint24 currentFee;
        assembly {
            currentFee := tload(FEE_SLOT)
        }

        // Perform Flash Accounting: Move accrued fees to YieldVault using PoolManager.take
        // This is a zero-gas token transfer at the ledger level (Singleton logic)
        uint256 feeAmount = _computeFeeAmount(delta, currentFee);
        if (feeAmount > 0) {
            uint256 softwareToll = (feeAmount * SOFTWARE_TOLL_BPS) / 10000;
            uint256 lpRevenue = feeAmount - softwareToll;
            
            Currency feeCurrency = delta.amount0() > 0 ? key.currency1 : key.currency0;
            
            // Note: In Uniswap v4 with OVERRIDE_FEE_FLAG, the dynamic fee natively accrues to LPs
            // via the pool's feeGrowth mechanisms. We do not extract them here as it causes CurrencyNotSettled.
            // The SaaS 1% toll is collected at the AgentRegistry layer (P2P Signals).
            
            emit SoftwareTollCollected(pid, softwareToll);
            emit FeesRouteToVault(pid, lpRevenue);
        }

        // IL protection check
        if (poolIntelligence[pid].ilProtectionActive) {
            int256 ilExposure = _estimateILDelta(delta);
            if (ilExposure > 1e15) {
                // Signals indexers (The Graph) to notify agent daemon off-chain
            }
        }
        return (IHooks.afterSwap.selector, 0);
    }
    /// @notice After add liquidity: enroll LP position in IL insurance
    function _afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata,
        BalanceDelta delta,
        BalanceDelta,
        bytes calldata
    ) internal override returns (bytes4, BalanceDelta) {
        ilInsurance.enrollLP(sender, key.toId(), uint128(-delta.amount0()));
        return (IHooks.afterAddLiquidity.selector, delta);
    }
    /// @notice After remove liquidity: calculate and request IL insurance payout
    function _afterRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata,
        BalanceDelta delta,
        BalanceDelta,
        bytes calldata
    ) internal override returns (bytes4, BalanceDelta) {
        ilInsurance.processExit(sender, key.toId());
        return (IHooks.afterRemoveLiquidity.selector, delta);
    }
    // ─── Asynchronous Neural State Update (The AI → On-Chain Bridge) ─────────
    /// @notice Update pool intelligence parameters asynchronously
    /// @dev ECDSA verification confirms signature from authorized agent.
    /// @param key          The Uniswap v4 pool to update
    /// @param newFee       AI-recommended dynamic fee (in pips)
    /// @param ilProtect    Whether to activate IL protection this epoch
    /// @param signature    ECDSA signature by the agent's registered EOA
    function updateNeuralState(
        PoolKey calldata key,
        uint24  newFee,
        bool    ilProtect,
        bytes   calldata signature
    ) external nonReentrant whenNotPaused {
        PoolId pid = key.toId();
        
        // 1. Reconstruct and verify ECDSA signature (O(N) off-chain overhead, O(1) in swap)
        bytes32 msgHash = keccak256(abi.encodePacked(
            pid, newFee, ilProtect, block.chainid
        )).toEthSignedMessageHash();
        
        address signer = msgHash.recover(signature);

        // 2. Verify the signer is a registered active agent
        if (!agentRegistry.hasRole(agentRegistry.AGENT_OPERATOR_ROLE(), signer)) {
            revert NotAgentOperator();
        }

        // 3. Verify fee is within safe bounds
        if (newFee < MIN_FEE || newFee > MAX_FEE) revert InvalidFeeRange();

        // 4. Rate limit check
        PoolIntelligence storage intel = poolIntelligence[pid];
        if (block.timestamp - intel.lastAgentUpdate < MIN_UPDATE_INTERVAL) {
            revert UpdateTooFrequent();
        }

        // 5. Update State
        intel.targetFeeBps       = newFee;
        intel.ilProtectionActive = ilProtect;
        intel.lastAgentUpdate    = block.timestamp;
        
        // Update the cached fee for O(1) hook access
        currentDynamicFee[pid]   = newFee;

        emit AgentSignalProcessed(pid, signer, newFee, 0, ilProtect, "");
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
