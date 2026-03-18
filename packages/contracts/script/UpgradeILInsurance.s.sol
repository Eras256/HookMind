// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script, console2} from "forge-std/Script.sol";
import {ILInsurance} from "../src/ILInsurance.sol";
import {HookMindCore} from "../src/HookMindCore.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UpgradeILInsurance is Script {
    address constant USDC = 0x31d0220469e10c4E71834a79b1f276d740d3768F;
    address constant HOOK = 0x56e1aC266Fa45824d02AFAf7569cdd6Fd1ee15c0;
    address constant YIELD_VAULT = 0x3138BC6729187d4E558747019eD1448a5a82e939;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        
        vm.startBroadcast(deployerKey);

        ILInsurance newInsurance = new ILInsurance(
            IERC20(USDC),
            HOOK,
            deployer
        );
        
        console2.log("New ILInsurance deployed at:", address(newInsurance));
        
        // Update Hook to use new Insurance
        HookMindCore(payable(HOOK)).setVaults(
            HookMindCore(payable(HOOK)).yieldVault(),
            newInsurance
        );
        
        console2.log("Hook updated to use new ILInsurance.");

        vm.stopBroadcast();
    }
}
