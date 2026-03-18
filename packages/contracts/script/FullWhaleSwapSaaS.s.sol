// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {HookMindCore} from "../src/HookMindCore.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {ModifyLiquidityParams, SwapParams} from "v4-core/src/types/PoolOperation.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

interface IPoolModifyLiquidityTest {
    function modifyLiquidity(
        PoolKey memory key,
        ModifyLiquidityParams memory params,
        bytes memory hookData
    ) external payable;
}

struct TestSettings {
    bool takeClaims;
    bool settleUsingBurn;
}

interface IPoolSwapTest {
    function swap(
        PoolKey memory key,
        SwapParams memory params,
        TestSettings memory testSettings,
        bytes memory hookData
    ) external payable;
}

contract FullWhaleSwapSaaS is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant MODIFY_ROUTER = 0x5fa728C0A5cfd51BEe4B060773f50554c0C8A7AB;
    address constant SWAP_ROUTER = 0x9140a78c1A137c7fF1c151EC8231272aF78a99A4;
    
    address constant HOOK = 0x79A386F18906F9B342eba270B59dd50c52C915C0; // SaaS Hook
    address constant EXISTING_USDC = 0x0c585cb79D92b255696d4ee2bcbBaa2dBd4d2B8F;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddr = vm.addr(deployerKey);
        vm.startBroadcast(deployerKey);

        // 1. Deploy new MockWETH
        MockUSDC mockWeth = new MockUSDC(); // We reuse MockUSDC to act as MockWETH with 6 decimals (easier math)
        console2.log("MockWETH Deployed at:", address(mockWeth));
        
        // Mint tokens
        mockWeth.mint(deployerAddr, 10000000 * 10**6);
        MockUSDC(EXISTING_USDC).mint(deployerAddr, 10000000 * 10**6);

        address WETH = address(mockWeth);
        address USDC = EXISTING_USDC;

        // 2. Initialize Pool
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

        uint160 sqrtPriceX96 = 79228162514264337593543950336; // 1.0 price
        try IPoolManager(POOL_MANAGER).initialize(key, sqrtPriceX96) returns (int24 tick) {
            console2.log("Pool initialized!");
        } catch {}

        // 3. Add Liquidity
        IERC20(Currency.unwrap(key.currency0)).approve(MODIFY_ROUTER, type(uint256).max);
        IERC20(Currency.unwrap(key.currency1)).approve(MODIFY_ROUTER, type(uint256).max);

        ModifyLiquidityParams memory liqParams = ModifyLiquidityParams({
            tickLower: -600,
            tickUpper: 600,
            liquidityDelta: 100000 * 1e6,
            salt: 0x0000000000000000000000000000000000000000000000000000000000000000
        });

        IPoolModifyLiquidityTest(MODIFY_ROUTER).modifyLiquidity(key, liqParams, "");
        console2.log("Liquidity added!");

        // 3.5 Submit Agent Signal to ACTIVATE IL Protection!
        uint256 agentKey = vm.envUint("AGENT_PRIVATE_KEY");
        // Create matching message hash for updateNeuralState
        bytes32 msgHash = keccak256(abi.encodePacked(
            key.toId(), uint24(3000), true, block.chainid
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            agentKey,
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash))
        );
        
        // We call it as deployer (anyone can submit since agent signed it)
        try HookMindCore(HOOK).updateNeuralState(
            key, 3000, true, abi.encodePacked(r, s, v)
        ) {
            console2.log("Agent Signal Submitted: IL Protection ACTIVATED!");
        } catch Error(string memory reason) {
            console2.log("Signal failed:", reason);
        } catch (bytes memory raw) {
            console2.log("Signal failed Raw:");
            console2.logBytes(raw);
        }

        // 4. Whale Swap
        IERC20(Currency.unwrap(key.currency0)).approve(SWAP_ROUTER, type(uint256).max);
        IERC20(Currency.unwrap(key.currency1)).approve(SWAP_ROUTER, type(uint256).max);

        bool zeroForOne = true;
        SwapParams memory swapParams = SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: -5000 * 10**6, // Massive dump
            sqrtPriceLimitX96: zeroForOne ? 4295128739 + 1 : 1461446703485210103287273052203988822378723970342 - 1 
        });

        TestSettings memory testSettings = TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        });

        IPoolSwapTest(SWAP_ROUTER).swap(key, swapParams, testSettings, "");
        console2.log("Whale Swap completed! Price crashed!");

        vm.stopBroadcast();
    }
}
