// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script, console2} from "forge-std/Script.sol";
import {HookMiner}  from "v4-periphery/src/utils/HookMiner.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {HookMindCore}  from "../src/HookMindCore.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {YieldVault}    from "../src/YieldVault.sol";
import {ILInsurance}   from "../src/ILInsurance.sol";
import {Hooks}         from "v4-core/src/libraries/Hooks.sol";
import {IERC20}        from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract DeployHookMind is Script {
    // Unichain Sepolia PoolManager (official address)
    address constant POOL_MANAGER = 0x38EB8B22Df3Ae7fb21e92881151B365Df14ba967;
    address constant USDC         = 0x078D782b760474a361dDA30f7B6B4AD1bf9b58b7;
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);
        address agentEOA    = vm.envAddress("AGENT_EOA_ADDRESS");
        vm.startBroadcast(deployerKey);
        // 1. Deploy AgentRegistry
        AgentRegistry registry = new AgentRegistry(deployer);
        console2.log("AgentRegistry:", address(registry));
        // 2. Mine a hook address with correct permission flags
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG  |
            Hooks.BEFORE_SWAP_FLAG       |
            Hooks.AFTER_SWAP_FLAG        |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG   |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
        bytes memory constructorArgs = abi.encode(
            IPoolManager(POOL_MANAGER),
            registry,
            address(0), // vault — deployed next
            address(0), // insurance — deployed after
            deployer
        );
        (address hookAddress, bytes32 salt) = HookMiner.find(
            deployer, flags, type(HookMindCore).creationCode, constructorArgs
        );
        console2.log("Mined hook address:", hookAddress);
        // 3. Deploy YieldVault
        YieldVault vault = new YieldVault(IERC20(USDC), hookAddress, deployer);
        console2.log("YieldVault:", address(vault));
        // 4. Deploy ILInsurance
        ILInsurance insurance = new ILInsurance(IERC20(USDC), hookAddress);
        console2.log("ILInsurance:", address(insurance));
        // 5. Deploy HookMindCore with mined salt
        HookMindCore hook = new HookMindCore{salt: salt}(
            IPoolManager(POOL_MANAGER),
            registry,
            vault,
            insurance,
            deployer
        );
        require(address(hook) == hookAddress, "Hook address mismatch");
        console2.log("HookMindCore:", address(hook));
        // 6. Register the AI agent operator
        registry.registerAgent(agentEOA, "anthropic");
        console2.log("Agent registered:", agentEOA);
        vm.stopBroadcast();
    }
}
