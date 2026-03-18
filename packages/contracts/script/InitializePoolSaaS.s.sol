// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

contract InitializePoolSaaS is Script {
    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant USDC = 0x0c585cb79D92b255696d4ee2bcbBaa2dBd4d2B8F; // Mock USDC
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant HOOK = 0x7a0bADB9079A4752F74d8eA330d871d6198415c0; // SaaS Hook

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(USDC),
            currency1: Currency.wrap(WETH),
            fee: 0x800000, // Dynamic fee flag
            tickSpacing: 60,
            hooks: IHooks(HOOK)
        });

        // Ensure currencies are sorted
        if (uint160(USDC) > uint160(WETH)) {
            key.currency0 = Currency.wrap(WETH);
            key.currency1 = Currency.wrap(USDC);
        }

        uint160 sqrtPriceX96 = 79228162514264337593543950336; // 1.0

        try IPoolManager(POOL_MANAGER).initialize(key, sqrtPriceX96) returns (int24 tick) {
            console2.log("SaaS Pool initialized! Tick:", tick);
            console2.log("Pool ID:");
            // Calculate PoolID
            // bytes32 id = keccak256(abi.encode(key));
            // console2.logBytes32(id);
        } catch Error(string memory reason) {
            console2.log("Failed with reason:", reason);
        } catch (bytes memory data) {
            console2.log("Failed with data:");
            console2.logBytes(data);
        }

        vm.stopBroadcast();
    }
}
