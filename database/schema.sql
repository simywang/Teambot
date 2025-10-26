-- Live of Interest Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Live of Interest main table
CREATE TABLE live_of_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teams_message_id VARCHAR(255) UNIQUE,
  teams_conversation_id VARCHAR(255) NOT NULL,
  customer VARCHAR(255) NOT NULL,
  product VARCHAR(100) NOT NULL,
  ratio DECIMAL(10,2) NOT NULL,
  incoterm VARCHAR(20) NOT NULL,
  period VARCHAR(50) NOT NULL,
  quantity_mt INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, confirmed, modified
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Modification history table
CREATE TABLE modification_history (
  id SERIAL PRIMARY KEY,
  loi_id UUID REFERENCES live_of_interests(id) ON DELETE CASCADE,
  modified_by VARCHAR(255) NOT NULL,
  modified_source VARCHAR(20) NOT NULL, -- 'teams' or 'web'
  changes JSONB NOT NULL,
  modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bot conversation state table (tracks last processing position)
CREATE TABLE bot_conversation_state (
  conversation_id VARCHAR(255) PRIMARY KEY,
  last_processed_message_id VARCHAR(255),
  last_card_timestamp TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_loi_conversation ON live_of_interests(teams_conversation_id);
CREATE INDEX idx_loi_status ON live_of_interests(status);
CREATE INDEX idx_loi_created_at ON live_of_interests(created_at DESC);
CREATE INDEX idx_modification_loi_id ON modification_history(loi_id);
CREATE INDEX idx_modification_timestamp ON modification_history(modified_at DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to live_of_interests table
CREATE TRIGGER update_loi_updated_at BEFORE UPDATE ON live_of_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to bot_conversation_state table
CREATE TRIGGER update_bot_state_updated_at BEFORE UPDATE ON bot_conversation_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

