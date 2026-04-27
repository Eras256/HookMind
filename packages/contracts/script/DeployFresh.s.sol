// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {HookMiner}        from "v4-periphery/src/utils/HookMiner.sol";
import {IPoolManager}     from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey}          from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency}         from "v4-core/src/types/Currency.sol";
import {IHooks}           from "v4-core/src/interfaces/IHooks.sol";
import {Hooks}            from "v4-core/src/libraries/Hooks.sol";
import {IERC20}           from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {HookMindCore}     from "../src/HookMindCore.sol";
import {AgentRegistry}    from "../src/AgentRegistry.sol";
import {YieldVault}       from "../src/YieldVault.sol";
import {ILInsurance}      from "../src/ILInsurance.sol";

contract DeployFresh is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    // Real USDC on Unichain Sepolia (Circle, 16.6M supply verified)
    address constant USDC         = 0x31d0220469e10c4E71834a79b1f276d740d3768F;
    address constant WETH         = 0x4200000000000000000000000000000000000006;
    // CREATE2 factory used by forge
    address constant CREATE2      = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);
        address agentEOA    = vm.envAddress("AGENT_EOA_ADDRESS");

        vm.startBroadcast(deployerKey);

        // ── 1. AgentRegistry ─────────────────────────────────────────────────
        AgentRegistry registry = new AgentRegistry(deployer, USDC, deployer);
        console2.log("AgentRegistry:", address(registry));

        // ── 2. Mine HookMindCore address ──────────────────────────────────────
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG         |
            Hooks.BEFORE_SWAP_FLAG              |
            Hooks.AFTER_SWAP_FLAG               |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG      |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG   |
            Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
        );
        bytes memory constructorArgs = abi.encode(
            IPoolManager(POOL_MANAGER), registry,
            address(0), address(0), deployer, deployer
        );
        (address hookAddr, bytes32 salt) = HookMiner.find(
            CREATE2, flags, type(HookMindCore).creationCode, constructorArgs
        );
        console2.log("Mined hook address:", hookAddr);

        // ── 3. YieldVault ─────────────────────────────────────────────────────
        YieldVault vault = new YieldVault(IERC20(USDC), hookAddr, deployer);
        console2.log("YieldVault:", address(vault));

        // ── 4. ILInsurance ────────────────────────────────────────────────────
        ILInsurance insurance = new ILInsurance(IERC20(USDC), hookAddr, deployer);
        console2.log("ILInsurance:", address(insurance));

        // ── 5. Deploy HookMindCore ────────────────────────────────────────────
        HookMindCore hook = new HookMindCore{salt: salt}(
            IPoolManager(POOL_MANAGER), registry,
            YieldVault(address(0)), ILInsurance(address(0)),
            deployer, deployer
        );
        require(address(hook) == hookAddr, "Hook address mismatch");
        hook.setVaults(vault, insurance);
        console2.log("HookMindCore:", address(hook));

        // ── 6. Register agent (0.0015 ETH fee) ────────────────────────────────
        uint256 fee = registry.activationFeeNative();
        registry.registerAgent{value: fee}(agentEOA, "claude", 0);
        console2.log("Agent registered:", agentEOA);

        // ── 7. Initialize USDC/WETH pool ──────────────────────────────────────
        // USDC (0x31d0..) < WETH (0x42..) → USDC is currency0
        PoolKey memory key = PoolKey({
            currency0:   Currency.wrap(USDC),
            currency1:   Currency.wrap(WETH),
            fee:         0x800000,   // dynamic fee flag
            tickSpacing: 60,
            hooks:       IHooks(hookAddr)
        });
        // sqrtPriceX96 for 1 WETH = 2000 USDC
        // price = 2000 * 1e6/1e18 = 2e-12  (USDC per WETH-unit)
        // sqrtPrice = sqrt(2000 * 1e6 / 1e18) * 2^96
        //           ≈ sqrt(2e-12) * 7.92e28 ≈ 1.414e-6 * 7.92e28 ≈ 1.12e23
        uint160 sqrtPriceX96 = 1120591884483034673197046;

        IPoolManager(POOL_MANAGER).initialize(key, sqrtPriceX96);

        bytes32 poolId = PoolId.unwrap(key.toId());
        console2.log("Pool initialized! PoolId:");
        console2.logBytes32(poolId);

        vm.stopBroadcast();

        // ── Print summary ──────────────────────────────────────────────────────
        console2.log("\n=== DEPLOYMENT SUMMARY ===");
        console2.log("HOOK_MIND_CORE_ADDRESS=", hookAddr);
        console2.log("AGENT_REGISTRY_ADDRESS=", address(registry));
        console2.log("YIELD_VAULT_ADDRESS=",    address(vault));
        console2.log("IL_INSURANCE_ADDRESS=",   address(insurance));
        console2.log("USDC_ADDRESS=", USDC);
        console2.log("TARGET_POOL_ID=");
        console2.logBytes32(poolId);
    }
}
