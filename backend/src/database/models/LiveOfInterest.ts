export interface LiveOfInterest {
  id: string;
  teams_message_id?: string;
  teams_conversation_id: string;
  customer: string;
  product: string;
  ratio: number;
  incoterm: string;
  period: string;
  quantity_mt: number;
  status: 'draft' | 'confirmed' | 'modified';
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLOIInput {
  teams_conversation_id: string;
  customer: string;
  product: string;
  ratio: number;
  incoterm: string;
  period: string;
  quantity_mt: number;
  created_by: string;
  teams_message_id?: string;
  status?: 'draft' | 'confirmed' | 'modified';
}

export interface UpdateLOIInput {
  customer?: string;
  product?: string;
  ratio?: number;
  incoterm?: string;
  period?: string;
  quantity_mt?: number;
  status?: 'draft' | 'confirmed' | 'modified';
  teams_message_id?: string;
}

export interface ModificationHistory {
  id: number;
  loi_id: string;
  modified_by: string;
  modified_source: 'teams' | 'web';
  changes: any;
  modified_at: Date;
}

export interface BotConversationState {
  conversation_id: string;
  last_processed_message_id?: string;
  last_card_timestamp?: Date;
  updated_at: Date;
}

