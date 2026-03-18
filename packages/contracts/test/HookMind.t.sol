// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {HookMindCore} from "../src/HookMindCore.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {YieldVault} from "../src/YieldVault.sol";
import {ILInsurance} from "../src/ILInsurance.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract HookMindTest is Test, Deployers {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    HookMindCore hook;
    AgentRegistry registry;
    YieldVault vault;
    ILInsurance insurance;
    MockERC20 usdc;

    function setUp() public {
        // 1. Deploy v4 environment
        deployFreshManagerAndRouters();
        
        // 2. Deploy infrastructure
        usdc = new MockERC20("USDC", "USDC", 6);
        registry = new AgentRegistry(address(this));
        
        // 3. Deploy Hook (using address(0) for circularity, then setVaults)
        hook = new HookMindCore(
            manager,
            registry,
            YieldVault(address(0)),
            ILInsurance(address(0)),
            address(this)
        );
        
        vault = new YieldVault(IERC20(address(usdc)), address(hook), address(this));
        insurance = new ILInsurance(IERC20(address(usdc)), address(hook), address(this));
        hook.setVaults(vault, insurance);

        // 4. Setup pool with DYNAMIC_FEE_FLAG
        // This is the requirement: LPFeeLibrary.DYNAMIC_FEE_FLAG
        key = PoolKey({
            currency0: Currency.wrap(address(usdc)),
            currency1: Currency.wrap(address(new MockERC20("WETH", "WETH", 18))),
            fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
            tickSpacing: 60,
            hooks: hook
        });
        
        // Sort currencies if needed (Deployers.sol usually handles this, but let's be safe)
        if (address(key.currency0) > address(key.currency1)) {
            (key.currency0, key.currency1) = (key.currency1, key.currency0);
        }

        manager.initialize(key, SQRT_PRICE_1_1, ZERO_BYTES);
        
        // 5. Provide Liquidity
        usdc.mint(address(this), 1000e6);
        MockERC20(Currency.unwrap(key.currency1)).mint(address(this), 1000e18);
        usdc.approve(address(modifyLiquidityRouter), 1000e6);
        MockERC20(Currency.unwrap(key.currency1)).approve(address(modifyLiquidityRouter), 1000e18);

        modifyLiquidityRouter.modifyLiquidity(
            key,
            IPoolManager.ModifyLiquidityParams(-600, 600, 10e18, 0),
            ZERO_BYTES
        );
    }

    function test_dynamicFeeAndFlashAccounting() public {
        // 1. Simulate AI Agent update
        uint24 newFee = 5000; // 0.5%
        hook.updateNeuralState_External(key, newFee, true); // Helper for testing without signatures

        // 2. Perform Swap
        // We expect the hook to 'take' the fee and move it to the YieldVault
        // using Flash Accounting (PoolManager.take in afterSwap)
        uint256 vaultBalanceBefore = usdc.balanceOf(address(vault));
        
        swapRouter.swap(
            key,
            IPoolManager.SwapParams({
                zeroForOne: true,
                amountSpecified: -1e6, // Swap 1 USDC
                sqrtPriceLimitX96: SQRT_PRICE_1_2
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ZERO_BYTES
        );

        uint256 vaultBalanceAfter = usdc.balanceOf(address(vault));
        
        // 3. Validate
        assertGt(vaultBalanceAfter, vaultBalanceBefore, "Vault should have received fees via Flash Accounting");
        console2.log("Fees collected in vault:", vaultBalanceAfter - vaultBalanceBefore);
    }
}

// Extension to allow testing without ECDSA signatures
contract HookMindCoreTesting is HookMindCore {
    constructor(
        IPoolManager _poolManager,
        AgentRegistry _agentRegistry,
        YieldVault _yieldVault,
        ILInsurance _ilInsurance,
        address _admin
    ) HookMindCore(_poolManager, _agentRegistry, _yieldVault, _ilInsurance, _admin) {}

    function updateNeuralState_External(PoolId pid, uint24 newFee, bool ilProtect) external {
        currentDynamicFee[pid] = newFee;
        poolIntelligence[pid].ilProtectionActive = ilProtect;
        poolIntelligence[pid].lastAgentUpdate = block.timestamp;
    }
}
