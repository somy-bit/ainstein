const { GoogleGenerativeAI } = require('@google/generative-ai');
import { ENV } from '../config/environment';

class GeminiModelService {
  private static instance: GeminiModelService;
  private workingModel: string | null = null;
  private genAI: any;

  private constructor() {
    this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY!);
  }

  public static getInstance(): GeminiModelService {
    if (!GeminiModelService.instance) {
      GeminiModelService.instance = new GeminiModelService();
    }
    return GeminiModelService.instance;
  }

  private async testModel(modelName: string): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      await model.generateContent('test');
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getWorkingModel(): Promise<string> {
    if (this.workingModel) {
      return this.workingModel;
    }

    // List of models to try in order of preference
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash', 
      'gemini-pro',
      'gemma-3-4b-it',
      'gemma-3-1b-it'
    ];

    console.log('🔍 Testing available models...');
    
    for (const modelName of modelsToTry) {
      console.log(`Testing model: ${modelName}`);
      if (await this.testModel(modelName)) {
        console.log(`✅ Found working model: ${modelName}`);
        this.workingModel = modelName;
        return modelName;
      }
    }

    throw new Error('No working Gemini models found with current API key');
  }

  public getGenerativeModel() {
    if (!this.workingModel) {
      throw new Error('No working model detected. Call getWorkingModel() first.');
    }
    return this.genAI.getGenerativeModel({ model: this.workingModel });
  }

  // Reset working model (useful when API key changes)
  public reset() {
    this.workingModel = null;
  }
}

export default GeminiModelService;
