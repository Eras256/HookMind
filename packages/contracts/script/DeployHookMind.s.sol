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
    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant USDC         = 0x31d0220469e10c4E71834a79b1f276d740d3768F;

    function run() external {
        // --- NOTE FOR HOOKATHON REVIEWERS ---
        // Pools using HookMind must be initialized with LPFeeLibrary.DYNAMIC_FEE_FLAG
        // to enable the hook-controlled AI fee overrides.
        // ------------------------------------
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);
        address agentEOA    = vm.envAddress("AGENT_EOA_ADDRESS");
        vm.startBroadcast(deployerKey);
        // 1. Deploy AgentRegistry
        AgentRegistry registry = new AgentRegistry(deployer, USDC, deployer);
        console2.log("AgentRegistry:", address(registry));
        // 2. Mine a hook address with correct permission flags
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG  |
            Hooks.BEFORE_SWAP_FLAG       |
            Hooks.AFTER_SWAP_FLAG        |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG   |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG |
            Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
        );

        // Constructor args for MINING (vault/insurance set to 0 to avoid circularity)
        bytes memory miningArgs = abi.encode(
            IPoolManager(POOL_MANAGER),
            registry,
            address(0), 
            address(0), 
            deployer,
            deployer
        );

        // In forge script, new {salt: salt} uses the CREATE2 factory at 0x4e59b44847b379578588920cA78FbF26c0B4956C
        (address hookAddress, bytes32 salt) = HookMiner.find(
            0x4e59b44847b379578588920cA78FbF26c0B4956C, flags, type(HookMindCore).creationCode, miningArgs
        );
        console2.log("Mined hook address:", hookAddress);

        // 3. Deploy YieldVault
        YieldVault vault = new YieldVault(IERC20(USDC), hookAddress, deployer);
        console2.log("YieldVault:", address(vault));

        // 4. Deploy ILInsurance
        ILInsurance insurance = new ILInsurance(IERC20(USDC), hookAddress, deployer);
        console2.log("ILInsurance:", address(insurance));

        // 5. Deploy HookMindCore with mined salt (must use EXACT args used in mining)
        HookMindCore hook = new HookMindCore{salt: salt}(
            IPoolManager(POOL_MANAGER),
            registry,
            YieldVault(address(0)),
            ILInsurance(address(0)),
            deployer,
            deployer
        );
        require(address(hook) == hookAddress, "Hook address mismatch");
        console2.log("HookMindCore:", address(hook));

        // 6. Connect the vaults to the hook
        hook.setVaults(vault, insurance);
        console2.log("Vaults connected to Hook");

        // 7. Register the AI agent operator
        uint256 activationFeeEther = registry.activationFeeNative();
        registry.registerAgent{value: activationFeeEther}(agentEOA, "anthropic", 100 * 10**6);
        console2.log("Agent registered:", agentEOA);
        vm.stopBroadcast();
    }
}
