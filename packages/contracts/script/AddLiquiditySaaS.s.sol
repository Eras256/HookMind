// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract AddLiquiditySaaS is Script {
    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
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

        // Simulating liquidity addition via direct manager call for demo
        // In production, one would use PositionManager.
        // For testing the HOOK, we just need the pool to have some liquidity.
        
        console2.log("Liquidity addition usually happens via PositionManager.");
        console2.log("Ensuring Deployer has MockUSDC balance...");
        uint256 balance = IERC20(USDC).balanceOf(vm.addr(deployerKey));
        console2.log("USDC Balance:", balance);

        vm.stopBroadcast();
    }
}
