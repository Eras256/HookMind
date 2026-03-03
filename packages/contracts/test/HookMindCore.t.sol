// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Test, console2}     from "forge-std/Test.sol";
import {StdInvariant}        from "forge-std/StdInvariant.sol";
import {Deployers}           from "@uniswap/v4-core/test/utils/Deployers.sol";
import {PoolManager}         from "v4-core/src/PoolManager.sol";
import {IPoolManager}        from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey}             from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {Hooks}               from "v4-core/src/libraries/Hooks.sol";
import {HookMindCore}  from "../src/HookMindCore.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {YieldVault}    from "../src/YieldVault.sol";
import {ILInsurance}   from "../src/ILInsurance.sol";
import {MockERC20}     from "./mocks/MockERC20.sol";
contract HookMindCoreTest is Test, Deployers {
    using PoolIdLibrary for PoolKey;
    HookMindCore  hook;
    AgentRegistry registry;
    YieldVault    vault;
    ILInsurance   insurance;
    MockERC20     usdc;
    address admin  = makeAddr("admin");
    address agent  = makeAddr("agent");
    uint256 agentKey;
    PoolKey poolKey;
    PoolId  poolId;
    function setUp() public {
        (agentKey,) = makeAddrAndKey("agent");
        // Deploy Uniswap v4 PoolManager via Deployers helper
        deployFreshManagerAndRouters();
        usdc     = new MockERC20("USDC", "USDC", 6);
        registry = new AgentRegistry(admin);
        // Deploy hook at address with correct flags using HookMiner pattern
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.AFTER_SWAP_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
        address hookAddr = address(flags); // simplified for test environment
        vault     = new YieldVault(usdc, hookAddr, admin);
        insurance = new ILInsurance(usdc, hookAddr);
        // Deploy hook via create2 at the exact mined address
        deployCodeTo("HookMindCore.sol", abi.encode(
            manager, registry, vault, insurance, admin
        ), hookAddr);
        hook = HookMindCore(hookAddr);
        // Register agent with ECDSA key
        vm.prank(admin);
        registry.registerAgent(vm.addr(agentKey), "anthropic");
        // Initialize a pool with the hook
        (poolKey,) = initPool(
            CurrencyLibrary.ADDRESS_ZERO,
            Currency.wrap(address(usdc)),
            hook,
            3000,
            SQRT_PRICE_1_1
        );
        poolId = poolKey.toId();
    }
    /// @notice CORE INVARIANT: fee must always be within [MIN_FEE, MAX_FEE]
    function invariant_fee_within_bounds() public view {
        HookMindCore.PoolIntelligence memory intel =
            hook.poolIntelligence(poolId);
        assertGe(intel.targetFeeBps, hook.MIN_FEE(), "Fee below minimum");
        assertLe(intel.targetFeeBps, hook.MAX_FEE(), "Fee above maximum");
    }
    /// @notice CORE INVARIANT: pool initialized after afterInitialize
    function invariant_pool_always_initialized() public view {
        HookMindCore.PoolIntelligence memory intel = hook.poolIntelligence(poolId);
        assertGt(intel.lastAgentUpdate, 0, "Pool never initialized");
    }
    /// @notice FUZZ: agent signal with random valid fees should always succeed
    function testFuzz_submitAgentSignal_validFee(uint24 fee) public {
        fee = uint24(bound(fee, hook.MIN_FEE(), hook.MAX_FEE()));
        uint256 nonce = registry.nonces(vm.addr(agentKey));
        bytes32 msgHash = keccak256(abi.encodePacked(
            poolId, fee, uint256(5000), true, "ipfs://test", nonce, block.chainid
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            agentKey,
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash))
        );
        vm.prank(vm.addr(agentKey));
        hook.submitAgentSignal(poolKey, fee, 5000, true, "ipfs://test", nonce,
                               abi.encodePacked(r, s, v));
        HookMindCore.PoolIntelligence memory intel = hook.poolIntelligence(poolId);
        assertEq(intel.targetFeeBps, fee);
    }
    /// @notice FUZZ: fees outside bounds must revert
    function testFuzz_submitSignal_outOfBounds_reverts(uint24 badFee) public {
        vm.assume(badFee < hook.MIN_FEE() || badFee > hook.MAX_FEE());
        uint256 nonce = registry.nonces(vm.addr(agentKey));
        bytes32 msgHash = keccak256(abi.encodePacked(
            poolId, badFee, uint256(5000), true, "ipfs://bad", nonce, block.chainid
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            agentKey,
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash))
        );
        vm.prank(vm.addr(agentKey));
        vm.expectRevert(HookMindCore.InvalidFeeRange.selector);
        hook.submitAgentSignal(poolKey, badFee, 5000, true, "ipfs://bad", nonce,
                               abi.encodePacked(r, s, v));
    }
    /// @notice Security: unauthorized address cannot submit signals
    function test_unauthorized_agent_reverts() public {
        address attacker = makeAddr("attacker");
        vm.prank(attacker);
        vm.expectRevert(HookMindCore.NotAgentOperator.selector);
        hook.submitAgentSignal(poolKey, 3000, 5000, true, "ipfs://evil", 0, "");
    }
    /// @notice Security: replayed nonce must revert
    function test_replay_attack_reverts() public {
        // first signal succeeds (nonce = 0)
        _submitValidSignal(3000, 0);
        // replay with same nonce
        vm.prank(vm.addr(agentKey));
        vm.expectRevert(HookMindCore.UpdateTooFrequent.selector);
        hook.submitAgentSignal(poolKey, 3000, 5000, true, "ipfs://replay", 0, "");
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────
    function _submitValidSignal(uint24 fee, uint256 nonce) internal {
        bytes32 msgHash = keccak256(abi.encodePacked(
            poolId, fee, uint256(5000), true, "ipfs://log", nonce, block.chainid
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            agentKey,
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash))
        );
        vm.prank(vm.addr(agentKey));
        hook.submitAgentSignal(poolKey, fee, 5000, true, "ipfs://log", nonce,
                               abi.encodePacked(r, s, v));
    }
}
