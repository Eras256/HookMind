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
import {MockUSDC}     from "../src/MockUSDC.sol";

contract DeployHookMindSaaS is Script {
    // Unichain Sepolia PoolManager (official address)
    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);
        address agentEOA    = vm.envAddress("AGENT_EOA_ADDRESS");
        address treasury    = deployer; 

        vm.startBroadcast(deployerKey);

        // 0. Deploy Mock USDC for E2E
        MockUSDC usdc = new MockUSDC();
        console2.log("Mock USDC Deployment:", address(usdc));
        usdc.mint(deployer, 1000 * 10**6); // Mint some for tests

        // 1. Deploy AgentRegistry with SaaS Config
        AgentRegistry registry = new AgentRegistry(deployer, address(usdc), treasury);
        console2.log("AgentRegistry (SaaS):", address(registry));

        // 2. Mine a hook address
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG  |
            Hooks.BEFORE_SWAP_FLAG       |
            Hooks.AFTER_SWAP_FLAG        |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG   |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG |
            Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
        );

        bytes memory miningArgs = abi.encode(
            IPoolManager(POOL_MANAGER),
            registry,
            address(0), 
            address(0), 
            deployer,
            treasury
        );

        (address hookAddress, bytes32 salt) = HookMiner.find(
            0x4e59b44847b379578588920cA78FbF26c0B4956C, flags, type(HookMindCore).creationCode, miningArgs
        );
        console2.log("Mined SaaS hook address:", hookAddress);

        // 3. Deploy YieldVault
        YieldVault vault = new YieldVault(IERC20(address(usdc)), hookAddress, deployer);
        console2.log("YieldVault:", address(vault));

        // 4. Deploy ILInsurance
        ILInsurance insurance = new ILInsurance(IERC20(address(usdc)), hookAddress, deployer);
        console2.log("ILInsurance:", address(insurance));

        // 5. Deploy HookMindCore with mined salt
        HookMindCore hook = new HookMindCore{salt: salt}(
            IPoolManager(POOL_MANAGER),
            registry,
            YieldVault(address(0)),
            ILInsurance(address(0)),
            deployer,
            treasury
        );
        require(address(hook) == hookAddress, "Hook address mismatch");
        console2.log("HookMindCore (SaaS):", address(hook));

        // 6. Connect the vaults to the hook
        hook.setVaults(vault, insurance);
        console2.log("Vaults connected to SaaS Hook");

        // 7. SaaS Activation: Pay native ETH and Register Agent
        uint256 activationFeeEther = registry.activationFeeNative();
        registry.registerAgent{value: activationFeeEther}(agentEOA, "openai", 100 * 10**6); // 100 USDC signal price
        console2.log("Agent License Activated for:", agentEOA);

        vm.stopBroadcast();
    }
}
