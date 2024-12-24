import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from '../env';

export class AiService {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateHeroName(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }
}