// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ModifyLiquidityParams, SwapParams} from "v4-core/src/types/PoolOperation.sol";

interface IPoolModifyLiquidityTest {
    function modifyLiquidity(
        PoolKey memory key,
        ModifyLiquidityParams memory params,
        bytes memory hookData
    ) external payable;
}

contract AddLiquidityRouter is Script {
    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant MODIFY_ROUTER = 0x5fa728C0A5cfd51BEe4B060773f50554c0C8A7AB;
    address constant USDC = 0x0c585cb79D92b255696d4ee2bcbBaa2dBd4d2B8F;
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant HOOK = 0x7a0bADB9079A4752F74d8eA330d871d6198415c0;

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

        // Approve tokens to Router
        IERC20(Currency.unwrap(key.currency0)).approve(MODIFY_ROUTER, type(uint256).max);
        IERC20(Currency.unwrap(key.currency1)).approve(MODIFY_ROUTER, type(uint256).max);

        ModifyLiquidityParams memory params = ModifyLiquidityParams({
            tickLower: -600,
            tickUpper: 600,
            liquidityDelta: 100 * 1e6, // Using small liquidity scaling for USDC mock
            salt: 0x0000000000000000000000000000000000000000000000000000000000000000
        });

        IPoolModifyLiquidityTest(MODIFY_ROUTER).modifyLiquidity(key, params, "");
        console2.log("Liquidity added via PoolModifyLiquidityTest Router!");

        vm.stopBroadcast();
    }
}
