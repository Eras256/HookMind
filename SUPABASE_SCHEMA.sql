-- SUPABASE_SCHEMA.sql
-- Run this script in your Supabase SQL Editor to set up the Database for HookMind Level 6

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (User/Agent Operators)
-- ==============================================================================
CREATE TABLE profiles (
    wallet_address VARCHAR(42) PRIMARY KEY, -- the EVM address
    username VARCHAR(100) UNIQUE,
    avatar TEXT,
    agent_node_uptime INTEGER DEFAULT 0, -- Time in seconds the desktop node has been running
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. STRATEGIES TABLE (Builder / Marketplace)
-- ==============================================================================
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(42) REFERENCES profiles(wallet_address) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level VARCHAR(50) CHECK (risk_level IN ('Low', 'Medium', 'High', 'Degen')),
    apy DECIMAL(10, 2) DEFAULT 0.0,
    is_public BOOLEAN DEFAULT false,
    configuration_json JSONB NOT NULL, -- Created from the ReactFlow builder
    installs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. AGENT LOGS TABLE (Realtime Execution feed)
-- ==============================================================================
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(42) REFERENCES profiles(wallet_address) ON DELETE CASCADE,
    pool_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    decision_ipfs_cid VARCHAR(255) NOT NULL,
    action_taken JSONB NOT NULL, -- Example: { "feeBps": 3000, "ilProtect": true, "volatility": 7000 }
    tx_hash VARCHAR(66)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read profiles, only the owner wallet can update
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." 
ON profiles FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Strategies: Anyone can view public strategies, owners can do full CRUD
CREATE POLICY "Public strategies are viewable by everyone." 
ON strategies FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage their own strategies." 
ON strategies FOR ALL USING (auth.uid()::text = user_id);

-- Agent Logs: Anyone can view logs for transparency, nodes insert logs
CREATE POLICY "Logs are viewable by everyone." 
ON agent_logs FOR SELECT USING (true);
CREATE POLICY "Nodes can insert logs." 
ON agent_logs FOR INSERT WITH CHECK (auth.uid()::text = agent_id);

-- ==============================================================================
-- REALTIME
-- ==============================================================================
-- Set replica identity for Realtime Engine
ALTER TABLE agent_logs REPLICA IDENTITY FULL;

-- Enable Supabase Realtime for the agent_logs table to fuel the Matrix UI
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE agent_logs, strategies;
COMMIT;
