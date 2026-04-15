// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title PredictiveInventoryModel
/// @notice Implements the mathematical formula for HookMind's dynamic fees.
/// @dev Calculates the Delta Fee based on volatility score and TWAP agreement.
library PredictiveInventoryModel {
    /// @notice Calculates the total dynamic fee based on statistical data
    /// @param baseFee The base fee of the pool in bps (e.g., 3000 = 0.3%)
    /// @param volatilityScore The normalized volatility score (0 to 10000, 10000 = max)
    /// @param twapAgreement A score representing how closely spot price matches TWAP (0 to 10000)
    /// @param amplificationFactor An admin-configurable multiplier for the fee delta (default: 3000)
    /// @return The resulting fee clamped to safe bounds (in bps)
    function calculateDynamicFee(
        uint24 baseFee,
        uint256 volatilityScore,
        uint256 twapAgreement,
        uint24 amplificationFactor
    ) internal pure returns (uint24) {
        // DeltaFee = BaseFee + AmplificationFactor * (VolatilityScore / 10000) * ( 1 - TWAPAgreement / 10000 )
        
        // Math is done with precision loss care
        uint256 disagreement = 10000 - twapAgreement;
        
        // Delta = alpha * (sigma / MAX_SIGMA) * (disagreement / MAX_DISAGREEMENT)
        uint256 deltaFee = (uint256(amplificationFactor) * volatilityScore * disagreement) / 100_000_000;
        
        uint256 totalFee = uint256(baseFee) + deltaFee;
        
        if (totalFee > type(uint24).max) {
            return type(uint24).max;
        }
        
        return uint24(totalFee);
    }
}
