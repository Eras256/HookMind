// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {IERC20}       from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PoolId}        from "v4-core/src/types/PoolId.sol";
/// @title ILInsurance — LP Protection Pool (UHI9: IL Insurance Hooks)
/// @notice LPs optionally pay a USDC premium to join insurance.
///         If their realized IL on exit exceeds threshold, they are compensated.
///         Circle USDC + CCTP v2 keep the pool liquid cross-chain.
contract ILInsurance is ReentrancyGuard {
    IERC20 public immutable usdc;
    address public immutable hook;
    // Premium: 10 USDC per enrollment (configurable by admin)
    uint256 public premiumAmount = 10e6; // 10 USDC (6 decimals)
    // Max payout per LP per exit: 500 USDC
    uint256 public maxPayoutPerLP = 500e6;
    // IL threshold to trigger payout: 2% (200 bps)
    uint256 public ilThresholdBps = 200;
    struct LPPosition {
        uint256 entryAmount0;   // token0 deposited at entry
        uint256 enrolledAt;
        bool    insured;
    }
    mapping(address => mapping(PoolId => LPPosition)) public positions;
    uint256 public poolBalance; // total USDC in insurance pool
    event LPEnrolled(address indexed lp, PoolId indexed poolId, uint256 premium);
    event ILPayout(address indexed lp, PoolId indexed poolId, uint256 payout);
    event PoolFunded(address indexed funder, uint256 amount);
    error OnlyHook();
    error NotInsured();
    error InsufficientPoolBalance();
    constructor(IERC20 _usdc, address _hook) {
        usdc = _usdc;
        hook = _hook;
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
    /// @notice Called by hook afterRemoveLiquidity — process potential IL payout
    function processExit(address lp, PoolId poolId) external nonReentrant {
        if (msg.sender != hook) revert OnlyHook();
        LPPosition storage pos = positions[lp][poolId];
        if (!pos.insured) return; // uninsured LP — no action
        // Simplified IL calculation (for demo). Production: use TWAP oracle.
        uint256 ilEstimate = _estimateIL(pos);
        if (ilEstimate > (pos.entryAmount0 * ilThresholdBps) / 10_000) {
            uint256 payout = ilEstimate > maxPayoutPerLP ? maxPayoutPerLP : ilEstimate;
            if (poolBalance < payout) revert InsufficientPoolBalance();
            poolBalance -= payout;
            pos.insured = false;
            usdc.transfer(lp, payout);
            emit ILPayout(lp, poolId, payout);
        }
        delete positions[lp][poolId];
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
