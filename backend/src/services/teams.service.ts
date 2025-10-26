import { TurnContext } from 'botbuilder';
import axios from 'axios';

interface TeamsMessage {
  id: string;
  from: {
    id: string;
    name: string;
  };
  text: string;
  timestamp: Date;
}

export class TeamsService {
  /**
   * Get conversation history from Teams
   * @param context Bot turn context
   * @param limit Maximum number of messages to retrieve
   * @param since Optional timestamp to get messages since
   * @param sinceMessageId Optional message ID to get messages after
   */
  async getConversationHistory(
    context: TurnContext,
    limit: number = 50,
    since?: Date,
    sinceMessageId?: string
  ): Promise<TeamsMessage[]> {
    try {
      const conversationId = context.activity.conversation.id;
      const serviceUrl = context.activity.serviceUrl;
      
      // Get the connector client from context
      const connector = context.turnState.get(context.adapter.ConnectorClientKey);
      
      if (!connector) {
        console.error('No connector client available');
        return [];
      }

      // Fetch conversation activities
      const activities = await connector.conversations.getConversationPagedMembers(conversationId);
      
      // Note: In a real implementation, you would use the Teams API or Microsoft Graph API
      // to fetch the actual message history. This is a simplified version.
      // You'll need to implement proper pagination and filtering based on timestamp/messageId
      
      const messages: TeamsMessage[] = [];
      
      // This is a placeholder - actual implementation would call Graph API
      console.log('Fetching conversation history - implement Graph API call here');
      
      return messages;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Parse command parameters from bot mention
   * Examples: "@bot", "@bot last 50", "@bot since 2 hours ago"
   */
  parseCommand(text: string): { limit?: number; sinceHours?: number } {
    const result: { limit?: number; sinceHours?: number } = {};
    
    // Remove bot mention
    const cleanText = text.replace(/<at>.*?<\/at>/g, '').trim().toLowerCase();
    
    // Parse "last N" pattern
    const lastMatch = cleanText.match(/last\s+(\d+)/);
    if (lastMatch) {
      result.limit = parseInt(lastMatch[1]);
    }
    
    // Parse "since N hours" pattern
    const sinceMatch = cleanText.match(/since\s+(\d+)\s+hours?/);
    if (sinceMatch) {
      result.sinceHours = parseInt(sinceMatch[1]);
    }
    
    return result;
  }

  /**
   * Extract user information from Teams context
   */
  getUserInfo(context: TurnContext) {
    return {
      id: context.activity.from.id,
      name: context.activity.from.name || 'Unknown User',
      aadObjectId: context.activity.from.aadObjectId,
    };
  }

  /**
   * Check if user mentioned the bot
   */
  isBotMentioned(context: TurnContext): boolean {
    const mentions = context.activity.entities?.filter(
      (entity: any) => entity.type === 'mention'
    );
    
    if (!mentions || mentions.length === 0) {
      return false;
    }
    
    const botId = context.activity.recipient.id;
    return mentions.some((mention: any) => mention.mentioned.id === botId);
  }

  /**
   * Remove bot mention from message text
   */
  removeBotMention(text: string): string {
    return text.replace(/<at>.*?<\/at>/g, '').trim();
  }

  /**
   * Get conversation ID from context
   */
  getConversationId(context: TurnContext): string {
    return context.activity.conversation.id;
  }

  /**
   * Check if conversation is a group chat
   */
  isGroupChat(context: TurnContext): boolean {
    return context.activity.conversation.conversationType === 'groupChat';
  }
}

export default new TeamsService();

