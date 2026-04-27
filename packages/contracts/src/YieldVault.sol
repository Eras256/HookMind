// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20}   from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20}  from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math}    from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
/// @title YieldVault — ERC-4626 Fee Smoothing Vault (UHI9 innovation)
/// @notice Core innovation: LP fees are NOT distributed immediately.
///         They drip-release over 7-day epochs, creating stable, predictable yield.
///         Inspired by YieldBasis fixed-income design + UHI9 fee-smoothing hook concept.
contract YieldVault is ERC4626 {
    using Math for uint256;
    using SafeERC20 for IERC20;
    
    uint256 public constant EPOCH_DURATION = 7 days;
    uint256 public epochStart;
    uint256 public epochFeesAccrued;
    uint256 public epochFeesReleased;
    // Hook address — only hook can deposit fees
    address public immutable HOOK;
    address public immutable ADMIN;
    bool public paused;

    event EpochStarted(uint256 timestamp, uint256 previousEpochFees);
    event FeeDeposited(uint256 amount, uint256 epochTotal);
    event YieldClaimed(address indexed lp, uint256 amount);
    event ProtocolPaused(address account);
    event ProtocolUnpaused(address account);
    error OnlyHook();
    error OnlyAdmin();
    error EpochNotComplete();
    error ContractPaused();

    modifier onlyAdmin() {
        if (msg.sender != ADMIN) revert OnlyAdmin();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }
    constructor(
        IERC20  _usdc,
        address _hook,
        address _admin
    ) ERC4626(_usdc) ERC20("HookMind Yield Shares", "hmYIELD") {
        HOOK       = _hook;
        ADMIN      = _admin;
        epochStart = block.timestamp;
    }
    /// @notice Circuit breaker for institutional risk management
    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        if (_paused) emit ProtocolPaused(msg.sender);
        else emit ProtocolUnpaused(msg.sender);
    }

    /// @notice Called by HookMindCore afterSwap to deposit accrued fees
    function depositFees(uint256 amount) external whenNotPaused {
        if (msg.sender != HOOK) revert OnlyHook();
        IERC20(asset()).safeTransferFrom(msg.sender, address(this), amount);
        epochFeesAccrued += amount;
        emit FeeDeposited(amount, epochFeesAccrued);
    }
    /// @notice Get current drip-release rate (fees per second this epoch)
    function currentDripRate() public view returns (uint256) {
        uint256 elapsed = block.timestamp - epochStart;
        if (elapsed == 0 || epochFeesAccrued == 0) return 0;
        return epochFeesAccrued / EPOCH_DURATION;
    }
    /// @notice Total assets available = released fees + base deposit
    function totalAssets() public view override returns (uint256) {
        uint256 elapsed    = Math.min(block.timestamp - epochStart, EPOCH_DURATION);
        uint256 released   = (epochFeesAccrued * elapsed) / EPOCH_DURATION;
        return released + super.totalAssets();
    }
    /// @notice Advance to next epoch (callable by anyone after 7 days)
    function advanceEpoch() external whenNotPaused {
        if (block.timestamp < epochStart + EPOCH_DURATION) revert EpochNotComplete();
        emit EpochStarted(block.timestamp, epochFeesAccrued);
        epochFeesAccrued   = 0;
        epochFeesReleased  = 0;
        epochStart         = block.timestamp;
    }
}
