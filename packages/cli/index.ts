#!/usr/bin/env node

/**
 * HookMind Level 6: Institutional Agent CLI Tool
 * Allows developers to instantly scaffold a new autonomous agent for Uniswap v4.
 */

import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";

async function run() {
    console.log(chalk.cyan.bold("\n🧠 HOOKMIND PROTOCOL v1.0.0 - AGENT NODE SCAFFOLDING\n"));

    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "network",
            message: "Select Network to Deploy your Agent:",
            choices: ["Unichain Mainnet", "Unichain Sepolia (Testnet)", "Base Mainnet"],
        },
        {
            type: "list",
            name: "provider",
            message: "Select the Neural Provider (LLM):",
            choices: ["Claude 4.6 (Recommended)", "GPT-4o", "Grok 3 (Realtime)", "Gemini 2.0", "Ollama (Local Privacy)"],
        },
        {
            type: "password",
            name: "privateKey",
            message: "Enter the ECDSA Private Key for your Agent Wallet (Will be saved in .env):",
            mask: "*",
        }
    ]);

    const spinner = ora("Scaffolding your HookMind Agent Directory...").start();

    setTimeout(() => {
        // Scaffold Directory
        const folderName = "my-hookmind-agent";
        const dirPath = path.join(process.cwd(), folderName);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Scaffold .env
        const envContent = `AGENT_PRIVATE_KEY=${answers.privateKey}
LLM_PROVIDER=${answers.provider.split(" ")[0].toLowerCase()}
NETWORK=${answers.network.split(" ")[0].toLowerCase()}
AGENT_UPDATE_INTERVAL_MS=12000
    `;
        fs.writeFileSync(path.join(dirPath, ".env"), envContent);

        // Scaffold strategy.ts
        const strategyContent = `import { VolatilityStrategy, ILMonitor } from "@hookmind/agent";

export async function onBlock(poolState: any) {
    console.log("Evaluating pool block:", poolState.blockNumber);
    // Custom Typescript logic for your agent runs here
    
    return {
        feeBps: 3000,
        activateIL: false,
        reasoning: "Normal market conditions, minimal risk observed."
    };
}
`;
        fs.writeFileSync(path.join(dirPath, "strategy.ts"), strategyContent);

        spinner.succeed(chalk.green(`Agent Node initialized in ./${folderName}\n`));
        console.log(chalk.white(`Next steps:`));
        console.log(chalk.cyan(`  cd ${folderName}`));
        console.log(chalk.cyan(`  npx @hookmind/cli start\n`));
    }, 1500);
}

run().catch((e) => {
    console.error(chalk.red(e));
    process.exit(1);
});
