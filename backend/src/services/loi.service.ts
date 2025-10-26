import { query } from '../database/connection';
import {
  LiveOfInterest,
  CreateLOIInput,
  UpdateLOIInput,
  ModificationHistory,
  BotConversationState,
} from '../database/models/LiveOfInterest';

export class LOIService {
  async createLOI(input: CreateLOIInput): Promise<LiveOfInterest> {
    const sql = `
      INSERT INTO live_of_interests 
        (teams_conversation_id, customer, product, ratio, incoterm, period, quantity_mt, status, created_by, teams_message_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      input.teams_conversation_id,
      input.customer,
      input.product,
      input.ratio,
      input.incoterm,
      input.period,
      input.quantity_mt,
      input.status || 'draft',
      input.created_by,
      input.teams_message_id || null,
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  async getLOIById(id: string): Promise<LiveOfInterest | null> {
    const sql = 'SELECT * FROM live_of_interests WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async getLOIByMessageId(messageId: string): Promise<LiveOfInterest | null> {
    const sql = 'SELECT * FROM live_of_interests WHERE teams_message_id = $1';
    const result = await query(sql, [messageId]);
    return result.rows[0] || null;
  }

  async getAllLOIs(conversationId?: string): Promise<LiveOfInterest[]> {
    let sql = 'SELECT * FROM live_of_interests';
    const values: any[] = [];
    
    if (conversationId) {
      sql += ' WHERE teams_conversation_id = $1';
      values.push(conversationId);
    }
    
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, values);
    return result.rows;
  }

  async updateLOI(id: string, input: UpdateLOIInput, modifiedBy: string, source: 'teams' | 'web'): Promise<LiveOfInterest> {
    // Get current LOI for change tracking
    const currentLOI = await this.getLOIById(id);
    if (!currentLOI) {
      throw new Error('LOI not found');
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.customer !== undefined) {
      updateFields.push(`customer = $${paramIndex++}`);
      values.push(input.customer);
    }
    if (input.product !== undefined) {
      updateFields.push(`product = $${paramIndex++}`);
      values.push(input.product);
    }
    if (input.ratio !== undefined) {
      updateFields.push(`ratio = $${paramIndex++}`);
      values.push(input.ratio);
    }
    if (input.incoterm !== undefined) {
      updateFields.push(`incoterm = $${paramIndex++}`);
      values.push(input.incoterm);
    }
    if (input.period !== undefined) {
      updateFields.push(`period = $${paramIndex++}`);
      values.push(input.period);
    }
    if (input.quantity_mt !== undefined) {
      updateFields.push(`quantity_mt = $${paramIndex++}`);
      values.push(input.quantity_mt);
    }
    if (input.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.teams_message_id !== undefined) {
      updateFields.push(`teams_message_id = $${paramIndex++}`);
      values.push(input.teams_message_id);
    }

    if (updateFields.length === 0) {
      return currentLOI;
    }

    values.push(id);
    const sql = `
      UPDATE live_of_interests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values);
    const updatedLOI = result.rows[0];

    // Log modification history
    await this.addModificationHistory(id, modifiedBy, source, input);

    return updatedLOI;
  }

  async deleteLOI(id: string): Promise<boolean> {
    const sql = 'DELETE FROM live_of_interests WHERE id = $1';
    const result = await query(sql, [id]);
    return (result.rowCount || 0) > 0;
  }

  async addModificationHistory(
    loiId: string,
    modifiedBy: string,
    source: 'teams' | 'web',
    changes: any
  ): Promise<ModificationHistory> {
    const sql = `
      INSERT INTO modification_history (loi_id, modified_by, modified_source, changes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(sql, [loiId, modifiedBy, source, JSON.stringify(changes)]);
    return result.rows[0];
  }

  async getModificationHistory(loiId: string): Promise<ModificationHistory[]> {
    const sql = 'SELECT * FROM modification_history WHERE loi_id = $1 ORDER BY modified_at DESC';
    const result = await query(sql, [loiId]);
    return result.rows;
  }

  async getConversationState(conversationId: string): Promise<BotConversationState | null> {
    const sql = 'SELECT * FROM bot_conversation_state WHERE conversation_id = $1';
    const result = await query(sql, [conversationId]);
    return result.rows[0] || null;
  }

  async updateConversationState(
    conversationId: string,
    messageId?: string,
    cardTimestamp?: Date
  ): Promise<BotConversationState> {
    const sql = `
      INSERT INTO bot_conversation_state (conversation_id, last_processed_message_id, last_card_timestamp)
      VALUES ($1, $2, $3)
      ON CONFLICT (conversation_id) 
      DO UPDATE SET 
        last_processed_message_id = COALESCE($2, bot_conversation_state.last_processed_message_id),
        last_card_timestamp = COALESCE($3, bot_conversation_state.last_card_timestamp)
      RETURNING *
    `;
    const result = await query(sql, [conversationId, messageId || null, cardTimestamp || null]);
    return result.rows[0];
  }
}

export default new LOIService();

