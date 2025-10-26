import { TurnContext, CardFactory } from 'botbuilder';
import loiService from '../services/loi.service';
import cardGenerator from './cardGenerator';
import teamsService from '../services/teams.service';
import { syncService } from '../services/sync.service';

export class ActionHandler {
  async handleAdaptiveCardAction(context: TurnContext): Promise<void> {
    try {
      const action = context.activity.value;
      const userInfo = teamsService.getUserInfo(context);

      if (!action || !action.action) {
        return;
      }

      switch (action.action) {
        case 'confirm':
          await this.handleConfirm(context, action, userInfo);
          break;
        case 'cancel':
          await this.handleCancel(context);
          break;
        case 'update':
          await this.handleUpdate(context, action, userInfo);
          break;
        default:
          console.log(`Unknown action: ${action.action}`);
      }
    } catch (error) {
      console.error('Error handling adaptive card action:', error);
      const errorCard = cardGenerator.generateErrorCard('An error occurred while processing your action.');
      await context.sendActivity({ attachments: [errorCard] });
    }
  }

  private async handleConfirm(context: TurnContext, action: any, userInfo: any): Promise<void> {
    const loiData = action.loiData;
    const conversationId = teamsService.getConversationId(context);

    if (!loiData) {
      await context.sendActivity('Invalid data. Please try again.');
      return;
    }

    // Create LOI in database
    const loi = await loiService.createLOI({
      teams_conversation_id: conversationId,
      customer: loiData.customer,
      product: loiData.product,
      ratio: parseFloat(loiData.ratio),
      incoterm: loiData.incoterm,
      period: loiData.period,
      quantity_mt: parseInt(loiData.quantity_mt),
      created_by: userInfo.name,
      status: 'confirmed',
    });

    // Send editable card to group chat
    const editableCard = cardGenerator.generateEditableCard(loi);
    const cardActivity = await context.sendActivity({ attachments: [editableCard] });

    // Update LOI with message ID for future reference
    if (cardActivity && cardActivity.id) {
      await loiService.updateLOI(
        loi.id,
        { teams_message_id: cardActivity.id },
        userInfo.name,
        'teams'
      );
    }

    // Update bot conversation state
    await loiService.updateConversationState(
      conversationId,
      context.activity.id,
      new Date()
    );

    // Notify web clients via Socket.io
    syncService.broadcastLOICreated(loi);

    // Delete the preview card (optional)
    try {
      await context.deleteActivity(context.activity.replyToId!);
    } catch (error) {
      console.log('Could not delete preview card:', error);
    }

    console.log(`LOI confirmed and created: ${loi.id}`);
  }

  private async handleCancel(context: TurnContext): Promise<void> {
    // Delete the preview card
    try {
      await context.deleteActivity(context.activity.replyToId!);
      await context.sendActivity('Live of Interest creation cancelled.');
    } catch (error) {
      console.log('Could not delete preview card:', error);
      await context.sendActivity('Cancelled.');
    }
  }

  private async handleUpdate(context: TurnContext, action: any, userInfo: any): Promise<void> {
    const loiId = action.loiId;
    
    if (!loiId) {
      await context.sendActivity('Invalid LOI ID.');
      return;
    }

    // Extract updated fields from action
    const updates: any = {};
    if (action.customer !== undefined) updates.customer = action.customer;
    if (action.product !== undefined) updates.product = action.product;
    if (action.ratio !== undefined) updates.ratio = parseFloat(action.ratio);
    if (action.incoterm !== undefined) updates.incoterm = action.incoterm;
    if (action.period !== undefined) updates.period = action.period;
    if (action.quantity_mt !== undefined) updates.quantity_mt = parseInt(action.quantity_mt);

    if (Object.keys(updates).length === 0) {
      await context.sendActivity('No changes detected.');
      return;
    }

    // Update status to modified
    updates.status = 'modified';

    // Update LOI in database
    const updatedLOI = await loiService.updateLOI(loiId, updates, userInfo.name, 'teams');

    // Update the card in place
    const updatedCard = cardGenerator.generateEditableCard(updatedLOI);
    await context.updateActivity({
      ...context.activity,
      id: context.activity.replyToId,
      attachments: [updatedCard],
    });

    // Send notification to group
    const notificationCard = cardGenerator.generateUpdateNotificationCard(userInfo.name, updates);
    await context.sendActivity({ attachments: [notificationCard] });

    // Notify web clients via Socket.io
    syncService.broadcastLOIUpdated(updatedLOI, userInfo.name, 'teams', updates);

    console.log(`LOI updated: ${loiId} by ${userInfo.name}`);
  }
}

export default new ActionHandler();

