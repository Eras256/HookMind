// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title AgentRegistry (HookMind Infrastructure & SaaS Licensing)
/// @notice Manages software licenses and P2P signal routing for autonomous AI agents.
/// @dev Implements a strictly non-custodial model for technological infrastructure tolls.
contract AgentRegistry is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_OPERATOR_ROLE = keccak256("AGENT_OPERATOR_ROLE");

    // ─── Infrastructure Settings ─────────────────────────────────────────────
    IERC20  public immutable SOFTWARE_TOKEN;      // Typically USDC
    address public protocolTreasury;             // Software license collector
    uint256 public activationFeeNative = 0.0015 ether; // ~ $5 USD in ETH
    uint256 public constant SOFTWARE_TOLL_BPS = 100;     // 1% Infrastructure Toll

    struct AgentProfile {
        address creator;        // The software license holder (owner)
        address operator;       // AI agent's signing EOA (hot wallet)
        string  llmProvider;    // Infrastructure stack (e.g., "openai", "anthropic")
        uint256 signalPrice;    // P2P price per strategy signal
        uint256 registeredAt;
        uint256 signalCount;    // total capacity utilized
        bool    active;
    }

    mapping(address => AgentProfile) public agents;
    address[] public agentList;

    // Signal tracking
    mapping(address => uint256) public nonces;
    mapping(address => string) public latestAuditCid;

    // ─── Events (SaaS & Marketplace) ─────────────────────────────────────────
    event AgentLicensingActivated(address indexed creator, address indexed operator, uint256 activationFee);
    event SignalMarketplacePurchase(address indexed buyer, address indexed operator, uint256 softwareToll, uint256 agentRevenue);
    event AgentDeactivated(address indexed operator);
    event SignalRecorded(address indexed operator, uint256 nonce, string ipfsCid);
    event SignalPriceUpdated(address indexed operator, uint256 newPrice);

    error AgentAlreadyRegistered();
    error AgentNotActive();
    error InvalidNonce();
    error UnauthorizedCreator();
    error InsufficientAllowance();

    constructor(address _admin, address _softwareToken, address _protocolTreasury) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        SOFTWARE_TOKEN = IERC20(_softwareToken);
        protocolTreasury = _protocolTreasury;
    }

    /// @notice Updates the protocol treasury address for software licensing revenue
    function setProtocolTreasury(address _newTreasury) external onlyRole(ADMIN_ROLE) {
        protocolTreasury = _newTreasury;
    }

    /// @notice Updates the native ETH activation fee dynamically
    function updateActivationFeeNative(uint256 _newFee) external onlyRole(ADMIN_ROLE) {
        activationFeeNative = _newFee;
    }

    /// @notice SaaS Activation: Registers an agent by paying the one-time activation fee in Native ETH
    /// @dev Atomic transfer from creator to treasury. No funds held in escrow.
    function registerAgent(
        address operator,
        string calldata llmProvider,
        uint256 initialSignalPrice
    ) external payable nonReentrant whenNotPaused {
        require(msg.value == activationFeeNative, "Exact native fee required");
        if (agents[operator].registeredAt != 0) revert AgentAlreadyRegistered();

        // Process SaaS Activation Fee (Native ETH directly to treasury)
        (bool success, ) = payable(protocolTreasury).call{value: msg.value}("");
        require(success, "Treasury transfer failed");

        agents[operator] = AgentProfile({
            creator:      msg.sender,
            operator:     operator,
            llmProvider:  llmProvider,
            signalPrice:  initialSignalPrice,
            registeredAt: block.timestamp,
            signalCount:  0,
            active:       true
        });

        agentList.push(operator);
        _grantRole(AGENT_OPERATOR_ROLE, operator);

        emit AgentLicensingActivated(msg.sender, operator, msg.value);
    }

    /// @notice P2P Marketplace: Purchase access to an agent's signal
    /// @dev Atomic non-custodial routing: 1% to protocol, 99% to creator.
    function purchaseAgentSignal(address operator) external nonReentrant whenNotPaused {
        AgentProfile storage agent = agents[operator];
        if (!agent.active) revert AgentNotActive();
        
        uint256 price = agent.signalPrice;
        if (price > 0) {
            uint256 softwareToll = (price * SOFTWARE_TOLL_BPS) / 10000;
            uint256 agentRevenue = price - softwareToll;

            // Atomic Routing (Direct to participants)
            SOFTWARE_TOKEN.safeTransferFrom(msg.sender, protocolTreasury, softwareToll);
            SOFTWARE_TOKEN.safeTransferFrom(msg.sender, agent.creator, agentRevenue);

            emit SignalMarketplacePurchase(msg.sender, operator, softwareToll, agentRevenue);
        }
    }

    /// @notice Allows a creator to adjust the P2P licensing price of their agent's signals
    function setSignalPrice(address operator, uint256 newPrice) external {
        if (agents[operator].creator != msg.sender) revert UnauthorizedCreator();
        agents[operator].signalPrice = newPrice;
        emit SignalPriceUpdated(operator, newPrice);
    }

    /// @notice Deactivate an agent license
    function deactivateAgent(address operator) external onlyRole(ADMIN_ROLE) {
        agents[operator].active = false;
        _revokeRole(AGENT_OPERATOR_ROLE, operator);
        emit AgentDeactivated(operator);
    }

    /// @notice Record a signal submission with its IPFS audit CID
    function recordSignal(
        address operator,
        uint256 nonce,
        string calldata ipfsCid
    ) external onlyRole(AGENT_OPERATOR_ROLE) {
        if (!agents[operator].active) revert AgentNotActive();
        if (nonce != nonces[operator]) revert InvalidNonce();
        
        nonces[operator]++;
        agents[operator].signalCount++;
        latestAuditCid[operator] = ipfsCid;
        
        emit SignalRecorded(operator, nonce, ipfsCid);
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }
}
