import { TurnContext, MessageFactory } from 'botbuilder';
import teamsService from '../services/teams.service';
import openaiService from '../services/openai.service';
import loiService from '../services/loi.service';
import cardGenerator from './cardGenerator';

export class MessageHandler {
  async handleMessage(context: TurnContext): Promise<void> {
    try {
      // Check if bot was mentioned
      if (!teamsService.isBotMentioned(context)) {
        return;
      }

      // Only respond in group chats
      if (!teamsService.isGroupChat(context)) {
        await context.sendActivity('This bot only works in group chats.');
        return;
      }

      const messageText = context.activity.text || '';
      const command = teamsService.parseCommand(messageText);
      const conversationId = teamsService.getConversationId(context);
      const userInfo = teamsService.getUserInfo(context);

      // Send typing indicator
      await context.sendActivity({ type: 'typing' });

      // Get conversation state to determine message range
      const botState = await loiService.getConversationState(conversationId);
      
      let messagesToAnalyze: string[] = [];
      
      // Determine message range based on command and bot state
      if (command.limit) {
        // User specified a limit (e.g., "last 50")
        const history = await teamsService.getConversationHistory(context, command.limit);
        messagesToAnalyze = history.map(msg => `${msg.from.name}: ${msg.text}`);
      } else if (command.sinceHours) {
        // User specified time range (e.g., "since 2 hours ago")
        const sinceDate = new Date(Date.now() - command.sinceHours * 60 * 60 * 1000);
        const history = await teamsService.getConversationHistory(context, 100, sinceDate);
        messagesToAnalyze = history.map(msg => `${msg.from.name}: ${msg.text}`);
      } else if (botState?.last_processed_message_id) {
        // Default: Get messages since last card was created
        const history = await teamsService.getConversationHistory(
          context,
          100,
          undefined,
          botState.last_processed_message_id
        );
        messagesToAnalyze = history.map(msg => `${msg.from.name}: ${msg.text}`);
      } else {
        // First time: Get last 30 messages as default
        const history = await teamsService.getConversationHistory(context, 30);
        messagesToAnalyze = history.map(msg => `${msg.from.name}: ${msg.text}`);
      }

      if (messagesToAnalyze.length === 0) {
        await context.sendActivity('No messages found to analyze.');
        return;
      }

      // Extract LOI data using Azure OpenAI
      const extractedData = await openaiService.extractLOIFromConversation(messagesToAnalyze);

      // Validate extracted data
      if (!extractedData.customer && !extractedData.product) {
        await context.sendActivity(
          'Could not extract Live of Interest information from the conversation. Please ensure the conversation contains customer and product details.'
        );
        return;
      }

      // Send preview card to the user who triggered the bot
      const previewCard = cardGenerator.generatePreviewCard(extractedData);
      await context.sendActivity({
        attachments: [previewCard],
        // This makes it visible only to the sender in group chat
        channelData: {
          notification: {
            alert: true,
          },
        },
      });

      console.log(`Preview card sent to ${userInfo.name} for conversation ${conversationId}`);
    } catch (error) {
      console.error('Error handling message:', error);
      const errorCard = cardGenerator.generateErrorCard(
        'An error occurred while processing your request. Please try again.'
      );
      await context.sendActivity({ attachments: [errorCard] });
    }
  }

  /**
   * Handle help command
   */
  async handleHelpCommand(context: TurnContext): Promise<void> {
    const helpText = `**Live of Interest Bot - Help**

**Commands:**
- \`@bot\` - Analyze messages since last card
- \`@bot last 50\` - Analyze last 50 messages
- \`@bot since 2 hours ago\` - Analyze messages from last 2 hours

**Features:**
- Automatically extracts customer, product, pricing, and delivery information from conversations
- Creates editable cards that can be modified by team members
- Syncs changes between Teams and web dashboard
- Tracks modification history

**How to use:**
1. Have a conversation about a trade in the group chat
2. Mention the bot with optional parameters
3. Review the preview card and click "Confirm"
4. The card will be shared with the team
5. Anyone can edit the card by updating fields and clicking "Save Changes"`;

    await context.sendActivity(MessageFactory.text(helpText));
  }
}

export default new MessageHandler();

