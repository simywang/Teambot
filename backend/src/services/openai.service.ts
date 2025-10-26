import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

interface ExtractedLOIData {
  customer: string | null;
  product: string | null;
  ratio: number | null;
  incoterm: string | null;
  period: string | null;
  quantity_mt: number | null;
}

export class OpenAIService {
  private client: OpenAI;
  private deploymentName: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
    });
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
  }

  async extractLOIFromConversation(messages: string[]): Promise<ExtractedLOIData> {
    const conversationText = messages.join('\n');

    const systemPrompt = `You are a professional commodity trading information extraction assistant.
Extract the following information from the conversation:
- customer: Customer name
- product: Product name (e.g., cocoa butter)
- ratio: Price ratio (numeric value)
- incoterm: Trade term (e.g., FOB, CIF)
- period: Time period (convert to standard format like "Jan-Jun 2026" or "H1 2026")
- quantity_mt: Quantity in metric tons (numeric value only)

Return ONLY a valid JSON object with these exact keys. If information is uncertain or missing, use null.
Do not include any explanations or additional text, only the JSON object.

Example format:
{
  "customer": "Lindt",
  "product": "cocoa butter",
  "ratio": 2.78,
  "incoterm": "FOB",
  "period": "Jan-Jun 2026",
  "quantity_mt": 100
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const extracted: ExtractedLOIData = JSON.parse(content);
      return extracted;
    } catch (error) {
      console.error('Error extracting LOI data from conversation:', error);
      throw error;
    }
  }

  async validateAndEnhanceLOIData(data: Partial<ExtractedLOIData>): Promise<ExtractedLOIData> {
    const prompt = `Given this partially extracted trading information, please validate and fill in any missing or uncertain fields if possible based on context:
${JSON.stringify(data, null, 2)}

Return a complete JSON object with all fields (customer, product, ratio, incoterm, period, quantity_mt).
Use null for truly missing information.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: [
          { role: 'system', content: 'You are a trading data validation assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error validating LOI data:', error);
      throw error;
    }
  }
}

export default new OpenAIService();

