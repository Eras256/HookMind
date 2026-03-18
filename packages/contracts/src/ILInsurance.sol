// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {IERC20}       from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AccessControl}    from "@openzeppelin/contracts/access/AccessControl.sol";
import {PoolId}           from "v4-core/src/types/PoolId.sol";
/// @title ILInsurance — LP Protection Pool (UHI9: IL Insurance Hooks)
/// @notice LPs optionally pay a USDC premium to join insurance.
///         If their realized IL on exit exceeds threshold, they are compensated.
///         Circle USDC + CCTP v2 keep the pool liquid cross-chain.
contract ILInsurance is ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public immutable usdc;
    address public immutable hook;
    
    uint256 public maxRiskFactor = 1500; // 15% Max risk per epoch
    uint256 public epochDuration = 7 days;
    uint256 public immutable genesisTime;

    // Premium: 10 USDC per enrollment (configurable by admin)
    uint256 public premiumAmount = 10e6; // 10 USDC (6 decimals)
    // IL threshold to trigger payout: 2% (200 bps)
    uint256 public ilThresholdBps = 200;
    // Max exposure per individual LP claim: 500 USDC
    uint256 public maxPayoutPerLP = 500e6;

    struct EpochState {
        uint256 totalExposure;
        uint256 balanceAtEnd;
        bool finalized;
    }

    mapping(uint256 => EpochState) public epochs;
    
    struct LPPosition {
        uint256 entryAmount0;   // token0 deposited at entry
        uint256 enrolledAt;
        bool    insured;
    }
    mapping(address => mapping(PoolId => LPPosition)) public positions;
    
    // lp => poolId => epoch => amount
    mapping(address => mapping(PoolId => mapping(uint256 => uint256))) public registeredExposurePerEpoch;
    mapping(address => mapping(PoolId => mapping(uint256 => bool))) public hasClaimed;

    uint256 public poolBalance; // total USDC in insurance pool
    event LPEnrolled(address indexed lp, PoolId indexed poolId, uint256 premium);
    event ILPayout(address indexed lp, PoolId indexed poolId, uint256 payout);
    event PoolFunded(address indexed funder, uint256 amount);
    error OnlyHook();
    error NotInsured();
    error InsufficientPoolBalance();
    constructor(IERC20 _usdc, address _hook, address _admin) {
        usdc = _usdc;
        hook = _hook;
        genesisTime = block.timestamp;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
    }

    function getCurrentEpoch() public view returns (uint256) {
        return (block.timestamp - genesisTime) / epochDuration;
    }
    /// @notice Called by hook afterAddLiquidity — enrolls LP with optional premium
    function enrollLP(
        address lp,
        PoolId poolId,
        uint128 entryAmount0
    ) external {
        if (msg.sender != hook) revert OnlyHook();
        // LP auto-enrolled; premium charged separately via UI
        positions[lp][poolId] = LPPosition({
            entryAmount0: entryAmount0,
            enrolledAt:   block.timestamp,
            insured:      false // becomes true when premium is paid
        });
    }
    /// @notice LP manually pays premium to activate insurance
    function payPremium(PoolId poolId) external nonReentrant {
        usdc.transferFrom(msg.sender, address(this), premiumAmount);
        poolBalance += premiumAmount;
        positions[msg.sender][poolId].insured = true;
        emit LPEnrolled(msg.sender, poolId, premiumAmount);
    }
    /// @notice Called by hook afterRemoveLiquidity — registers potential IL loss for current epoch
    function processExit(address lp, PoolId poolId) external nonReentrant {
        if (msg.sender != hook) revert OnlyHook();
        LPPosition storage pos = positions[lp][poolId];
        if (!pos.insured) return; // uninsured LP — no action

        uint256 ilEstimate = _estimateIL(pos);
        // Using pool metadata from positions (entryAmount0 * threshold / 10000)
        if (ilEstimate > (pos.entryAmount0 * ilThresholdBps) / 10_000) {
            uint256 exposure = ilEstimate > maxPayoutPerLP ? maxPayoutPerLP : ilEstimate;
            uint256 epochId = getCurrentEpoch();
            
            registeredExposurePerEpoch[lp][poolId][epochId] += exposure;
            epochs[epochId].totalExposure += exposure;
        }
        delete positions[lp][poolId];
    }

    /// @notice Settle and withdraw prorated insurance payout after epoch ends
    /// @param lpTokenId The PoolId cast to uint256 (identifier for the pool position)
    /// @param deltaExposure The expected exposure amount to verify against registered state
    function claimInsurance(uint256 lpTokenId, uint256 deltaExposure) external nonReentrant {
        PoolId poolId = PoolId.wrap(bytes32(lpTokenId));
        uint256 currentEpoch = getCurrentEpoch();
        
        // Safety: Can only claim for completed epochs to ensure prorating is accurate
        require(currentEpoch > 0, "No epochs completed");
        uint256 targetEpoch = currentEpoch - 1;

        if (hasClaimed[msg.sender][poolId][targetEpoch]) revert("Already claimed for this epoch");
        if (registeredExposurePerEpoch[msg.sender][poolId][targetEpoch] != deltaExposure) revert("Invalid exposure value");
        if (deltaExposure == 0) revert("No loss registered");

        EpochState storage state = epochs[targetEpoch];

        // Lazy Finalization: First claimer of the epoch snapshots the liquid balance
        if (!state.finalized) {
            state.balanceAtEnd = poolBalance;
            state.finalized = true;
        }

        // P_max = L_vault * maxRiskFactor / 10000
        uint256 pMax = (state.balanceAtEnd * maxRiskFactor) / 10_000;
        uint256 payout;

        if (state.totalExposure <= pMax) {
            payout = deltaExposure;
        } else {
            // Prorated Payout = (userExposure * pMax) / totalExposureThisEpoch
            // Solidity 0.8 handles overflows; we perform multiplication before division for precision
            payout = (deltaExposure * pMax) / state.totalExposure;
        }

        hasClaimed[msg.sender][poolId][targetEpoch] = true;
        poolBalance -= payout;
        usdc.transfer(msg.sender, payout);

        emit ILPayout(msg.sender, poolId, payout);
    }

    /// @notice Helper for verification: calculates what the payout WOULD be right now
    function calculateProratedPayout(uint256 deltaExposure) public view returns (uint256) {
        uint256 pMax = (poolBalance * maxRiskFactor) / 10_000;
        uint256 currentEpoch = getCurrentEpoch();
        uint256 totalExposure = epochs[currentEpoch].totalExposure;

        if (totalExposure <= pMax || totalExposure == 0) {
            return deltaExposure > maxPayoutPerLP ? maxPayoutPerLP : deltaExposure;
        } else {
            uint256 payout = (deltaExposure * pMax) / totalExposure;
            return payout > maxPayoutPerLP ? maxPayoutPerLP : payout;
        }
    }

    // ─── Governance Setters ──────────────────────────────────────────────────

    /// @dev Permite al Admin ajustar el límite máximo de riesgo por época (Max 50% = 5000)
    function setMaxRiskFactor(uint256 _newRiskFactor) external onlyRole(ADMIN_ROLE) {
        require(_newRiskFactor <= 5000, "Risk_Factor_Too_High"); 
        maxRiskFactor = _newRiskFactor;
    }

    /// @dev Permite al Admin ajustar la duración de la época (Min 1 día para evitar spam)
    function setEpochDuration(uint256 _newDuration) external onlyRole(ADMIN_ROLE) {
        require(_newDuration >= 1 days, "Epoch_Too_Short");
        epochDuration = _newDuration;
    }
    /// @notice Anyone can fund the pool (protocol treasury, Circle CCTP, etc.)
    function fundPool(uint256 amount) external nonReentrant {
        usdc.transferFrom(msg.sender, address(this), amount);
        poolBalance += amount;
        emit PoolFunded(msg.sender, amount);
    }
    function _estimateIL(LPPosition memory pos) internal view returns (uint256) {
        // Placeholder: production agent provides this off-chain and calls a setter.
        // When AI agent calls submitAgentSignal it can also post IL estimates.
        uint256 holdingDuration = block.timestamp - pos.enrolledAt;
        return (pos.entryAmount0 * holdingDuration * 5) / (365 days * 10_000);
    }
}
