// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPositionManager {
    struct MintParams {
        PoolKey poolKey;
        int24 tickLower;
        int24 tickUpper;
        uint256 liquidity;
        uint128 amount0Max;
        uint128 amount1Max;
        address recipient;
        uint128 deadline;
    }
    function mint(MintParams calldata params) external payable returns (uint256 tokenId, uint128 amount0, uint128 amount1);
}

contract AddLiquidityPM is Script {
    address constant PM = 0xf969Aee60879C54bAAed9F3eD26147Db216Fd664;
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

        // Standard tick range around 1.0 (tick 0)
        IPositionManager.MintParams memory params = IPositionManager.MintParams({
            poolKey: key,
            tickLower: -600,
            tickUpper: 600,
            liquidity: 100 * 10**6, // Use a small amount of liquidity to start
            amount0Max: 1000 * 10**18, // High tolerance
            amount1Max: 1000 * 10**18,
            recipient: vm.addr(deployerKey),
            deadline: uint128(block.timestamp + 3600)
        });

        // Simplified call
        IPositionManager(PM).mint(params);
        console2.log("Liquidity addition called!");

        vm.stopBroadcast();
    }
}
