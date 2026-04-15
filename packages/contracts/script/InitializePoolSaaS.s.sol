// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

contract InitializePoolSaaS is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address poolManager = vm.envAddress("POOL_MANAGER_ADDRESS");
        address usdc        = vm.envAddress("USDC_UNICHAIN");
        address weth        = vm.envAddress("WETH_ADDRESS");
        address hookAddr    = vm.envAddress("HOOK_MIND_CORE_ADDRESS");

        vm.startBroadcast(deployerKey);

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(usdc),
            currency1: Currency.wrap(weth),
            fee: 0x800000, // Dynamic fee flag
            tickSpacing: 60,
            hooks: IHooks(hookAddr)
        });

        // Ensure currencies are sorted
        if (uint160(usdc) > uint160(weth)) {
            key.currency0 = Currency.wrap(weth);
            key.currency1 = Currency.wrap(usdc);
        }

        uint160 sqrtPriceX96 = 79228162514264337593543950336; // 1.0

        try IPoolManager(poolManager).initialize(key, sqrtPriceX96) returns (int24 tick) {
            console2.log("SaaS Pool initialized! Tick:", tick);
            bytes32 id = keccak256(abi.encode(key));
            console2.log("Pool ID:");
            console2.logBytes32(id);
        } catch Error(string memory reason) {
            console2.log("Failed with reason:", reason);
        } catch (bytes memory data) {
            console2.log("Failed with data:");
            console2.logBytes(data);
        }

        vm.stopBroadcast();
    }
}
