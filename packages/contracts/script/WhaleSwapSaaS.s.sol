// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ModifyLiquidityParams, SwapParams} from "v4-core/src/types/PoolOperation.sol";

struct TestSettings {
    bool takeClaims;
    bool settleUsingBurn;
}

interface IPoolSwapTest {
    function swap(
        PoolKey memory key,
        SwapParams memory params,
        TestSettings memory testSettings,
        bytes memory hookData
    ) external payable;
}

contract WhaleSwapSaaS is Script {
    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant SWAP_ROUTER = 0x9140a78c1A137c7fF1c151EC8231272aF78a99A4; // Need correct Unichain Sepolia router
    address constant USDC = 0x0c585cb79D92b255696d4ee2bcbBaa2dBd4d2B8F;
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant HOOK = 0x7a0bADB9079A4752F74d8eA330d871d6198415c0; // SaaS Hook

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(USDC),
            currency1: Currency.wrap(WETH),
            fee: 0x800000,
            tickSpacing: 60,
            hooks: IHooks(HOOK)
        });

        if (uint160(USDC) > uint160(WETH)) {
            key.currency0 = Currency.wrap(WETH);
            key.currency1 = Currency.wrap(USDC);
        }
        
        bool zeroForOne = uint160(USDC) < uint160(WETH);

        // Approve tokens to Router
        IERC20(Currency.unwrap(key.currency0)).approve(SWAP_ROUTER, type(uint256).max);
        IERC20(Currency.unwrap(key.currency1)).approve(SWAP_ROUTER, type(uint256).max);

        SwapParams memory params = SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: -100 * 10**6, // Exact input: dump 100 USDC
            sqrtPriceLimitX96: zeroForOne ? 4295128739 + 1 : 1461446703485210103287273052203988822378723970342 - 1 
        });

        TestSettings memory testSettings = TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        });

        IPoolSwapTest(SWAP_ROUTER).swap(key, params, testSettings, "");
        console2.log("Whale swap executed!");

        vm.stopBroadcast();
    }
}
