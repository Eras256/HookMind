// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
/// @title AgentRegistry
/// @notice Manages trusted AI Agent Operator EOA addresses (the Nirium pattern adapted to v4)
/// @dev Mirrors Nirium's RBAC: ADMIN_ROLE (cold multisig) vs AGENT_OPERATOR_ROLE (hot AI wallet)
contract AgentRegistry is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_OPERATOR_ROLE = keccak256("AGENT_OPERATOR_ROLE");
    struct AgentProfile {
        address operator;       // AI agent's signing EOA
        string  llmProvider;    // "anthropic" | "openai" | "gemini" | "grok" | "ollama"
        uint256 registeredAt;
        uint256 signalCount;    // total on-chain signals submitted
        bool    active;
    }
    mapping(address => AgentProfile) public agents;
    address[] public agentList;
    // Signal nonce per agent — prevents replay attacks on hook signals
    mapping(address => uint256) public nonces;
    // IPFS CID of latest agent execution log (mirrors Nirium's Pinata audit trail)
    mapping(address => string) public latestAuditCID;
    event AgentRegistered(address indexed operator, string llmProvider);
    event AgentDeactivated(address indexed operator);
    event SignalRecorded(address indexed operator, uint256 nonce, string ipfsCID);
    error AgentAlreadyRegistered();
    error AgentNotActive();
    error InvalidNonce();
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }
    /// @notice Register a new AI agent operator
    function registerAgent(
        address operator,
        string calldata llmProvider
    ) external onlyRole(ADMIN_ROLE) {
        if (agents[operator].registeredAt != 0) revert AgentAlreadyRegistered();
        agents[operator] = AgentProfile({
            operator:     operator,
            llmProvider:  llmProvider,
            registeredAt: block.timestamp,
            signalCount:  0,
            active:       true
        });
        agentList.push(operator);
        _grantRole(AGENT_OPERATOR_ROLE, operator);
        emit AgentRegistered(operator, llmProvider);
    }
    /// @notice Deactivate an agent (circuit breaker — mirrors Nirium's Pausable pattern)
    function deactivateAgent(address operator) external onlyRole(ADMIN_ROLE) {
        agents[operator].active = false;
        _revokeRole(AGENT_OPERATOR_ROLE, operator);
        emit AgentDeactivated(operator);
    }
    /// @notice Record a signal submission with its IPFS audit CID
    /// @dev Called by HookMindCore after processing agent signal
    function recordSignal(
        address operator,
        uint256 nonce,
        string calldata ipfsCID
    ) external onlyRole(AGENT_OPERATOR_ROLE) {
        if (!agents[operator].active) revert AgentNotActive();
        if (nonce != nonces[operator]) revert InvalidNonce();
        nonces[operator]++;
        agents[operator].signalCount++;
        latestAuditCID[operator] = ipfsCID;
        emit SignalRecorded(operator, nonce, ipfsCID);
    }
    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }
}
