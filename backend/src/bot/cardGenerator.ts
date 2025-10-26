import { CardFactory, Attachment } from 'botbuilder';
import { ExtractedLOIData } from '../services/openai.service';
import { LiveOfInterest } from '../database/models/LiveOfInterest';

export class CardGenerator {
  /**
   * Generate preview card (visible only to sales manager who triggered the bot)
   */
  generatePreviewCard(data: any, loiId?: string): Attachment {
    const card = {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Live of Interest - Preview',
          weight: 'Bolder',
          size: 'Large',
          color: 'Accent',
        },
        {
          type: 'TextBlock',
          text: 'Please review the extracted information and confirm to share with the team.',
          wrap: true,
          spacing: 'Small',
          isSubtle: true,
        },
        {
          type: 'FactSet',
          facts: [
            { title: 'Customer', value: data.customer || 'N/A' },
            { title: 'Product', value: data.product || 'N/A' },
            { title: 'Ratio', value: data.ratio ? data.ratio.toString() : 'N/A' },
            { title: 'Incoterm', value: data.incoterm || 'N/A' },
            { title: 'Period', value: data.period || 'N/A' },
            { title: 'Quantity', value: data.quantity_mt ? `${data.quantity_mt} MT` : 'N/A' },
          ],
          spacing: 'Medium',
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Confirm',
          style: 'positive',
          data: {
            action: 'confirm',
            loiData: data,
            loiId: loiId,
          },
        },
        {
          type: 'Action.Submit',
          title: 'Cancel',
          style: 'destructive',
          data: {
            action: 'cancel',
          },
        },
      ],
    };

    return CardFactory.adaptiveCard(card);
  }

  /**
   * Generate editable card (visible in group chat)
   */
  generateEditableCard(loi: LiveOfInterest): Attachment {
    const card = {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Live of Interest',
          weight: 'Bolder',
          size: 'Large',
          color: 'Accent',
        },
        {
          type: 'TextBlock',
          text: `Status: ${loi.status.toUpperCase()}`,
          spacing: 'Small',
          isSubtle: true,
        },
        {
          type: 'TextBlock',
          text: 'Customer',
          weight: 'Bolder',
          spacing: 'Medium',
        },
        {
          type: 'Input.Text',
          id: 'customer',
          value: loi.customer,
          placeholder: 'Enter customer name',
        },
        {
          type: 'TextBlock',
          text: 'Product',
          weight: 'Bolder',
          spacing: 'Small',
        },
        {
          type: 'Input.Text',
          id: 'product',
          value: loi.product,
          placeholder: 'Enter product',
        },
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Ratio',
                  weight: 'Bolder',
                },
                {
                  type: 'Input.Number',
                  id: 'ratio',
                  value: loi.ratio,
                  placeholder: 'Enter ratio',
                },
              ],
            },
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Incoterm',
                  weight: 'Bolder',
                },
                {
                  type: 'Input.Text',
                  id: 'incoterm',
                  value: loi.incoterm,
                  placeholder: 'FOB, CIF, etc.',
                },
              ],
            },
          ],
          spacing: 'Small',
        },
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Period',
                  weight: 'Bolder',
                },
                {
                  type: 'Input.Text',
                  id: 'period',
                  value: loi.period,
                  placeholder: 'e.g., Jan-Jun 2026',
                },
              ],
            },
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Quantity (MT)',
                  weight: 'Bolder',
                },
                {
                  type: 'Input.Number',
                  id: 'quantity_mt',
                  value: loi.quantity_mt,
                  placeholder: 'Enter quantity',
                },
              ],
            },
          ],
          spacing: 'Small',
        },
        {
          type: 'TextBlock',
          text: `Created by: ${loi.created_by} | ${new Date(loi.created_at).toLocaleString()}`,
          size: 'Small',
          isSubtle: true,
          spacing: 'Medium',
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Save Changes',
          style: 'positive',
          data: {
            action: 'update',
            loiId: loi.id,
          },
        },
      ],
    };

    return CardFactory.adaptiveCard(card);
  }

  /**
   * Generate confirmation message card
   */
  generateConfirmationCard(message: string): Attachment {
    const card = {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: message,
          wrap: true,
          color: 'Good',
        },
      ],
    };

    return CardFactory.adaptiveCard(card);
  }

  /**
   * Generate error message card
   */
  generateErrorCard(error: string): Attachment {
    const card = {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Error',
          weight: 'Bolder',
          color: 'Attention',
        },
        {
          type: 'TextBlock',
          text: error,
          wrap: true,
          spacing: 'Small',
        },
      ],
    };

    return CardFactory.adaptiveCard(card);
  }

  /**
   * Generate update notification card
   */
  generateUpdateNotificationCard(updatedBy: string, changes: any): Attachment {
    const changesList = Object.entries(changes)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    const card = {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Live of Interest Updated',
          weight: 'Bolder',
          color: 'Accent',
        },
        {
          type: 'TextBlock',
          text: `Updated by: ${updatedBy}`,
          spacing: 'Small',
          isSubtle: true,
        },
        {
          type: 'TextBlock',
          text: 'Changes:',
          weight: 'Bolder',
          spacing: 'Medium',
        },
        {
          type: 'TextBlock',
          text: changesList,
          wrap: true,
          spacing: 'Small',
        },
      ],
    };

    return CardFactory.adaptiveCard(card);
  }
}

export default new CardGenerator();

