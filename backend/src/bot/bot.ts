import {
  TeamsActivityHandler,
  TurnContext,
  MessageFactory,
  CardFactory,
  ActivityTypes,
} from 'botbuilder';
import messageHandler from './messageHandler';
import actionHandler from './actionHandler';

export class LOIBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Handle incoming messages
    this.onMessage(async (context: TurnContext, next) => {
      console.log('Received message:', context.activity.text);

      // Check if it's an adaptive card action
      if (context.activity.value) {
        await actionHandler.handleAdaptiveCardAction(context);
      } else {
        // Handle text message
        const text = context.activity.text?.toLowerCase() || '';
        
        if (text.includes('help')) {
          await messageHandler.handleHelpCommand(context);
        } else {
          await messageHandler.handleMessage(context);
        }
      }

      await next();
    });

    // Handle members added to conversation
    this.onMembersAdded(async (context: TurnContext, next) => {
      const membersAdded = context.activity.membersAdded || [];
      
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          const welcomeMessage = `Welcome to the Live of Interest Bot! 

I can help you automatically extract and track trade information from your conversations.

**Quick Start:**
- Discuss a trade in the group chat
- Mention me with \`@${context.activity.recipient.name}\`
- I'll extract the key information and create a card
- Team members can edit the card as needed
- All changes sync with the web dashboard

Type \`@${context.activity.recipient.name} help\` for more information.`;

          await context.sendActivity(MessageFactory.text(welcomeMessage));
        }
      }

      await next();
    });

    // Handle bot being added to a conversation
    this.onConversationUpdate(async (context: TurnContext, next) => {
      console.log('Conversation update:', context.activity.type);
      await next();
    });

    // Handle reactions to messages
    this.onMessageReaction(async (context: TurnContext, next) => {
      console.log('Message reaction:', context.activity);
      await next();
    });

    // Handle any errors
    this.onDialog(async (context: TurnContext, next) => {
      console.log('Running dialog with activity:', context.activity.type);
      await next();
    });
  }
}

