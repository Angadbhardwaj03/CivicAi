import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('Google Generative AI Client Initialized');
    } else {
      this.logger.warn('GEMINI_API_KEY is not set. AI Features will fall back to mocked responses.');
    }
  }

  /**
   * Real implementation of Google Gemini text categorization + Vision.
   */
  async analyzeComplaint(description: string, file?: Express.Multer.File) {
    this.logger.log(`Analyzing complaint: ${description}`);
    const hasImage = !!file;

    if (!this.genAI) {
      // Fallback to Mock if key is not configured
      const lowerDesc = description.toLowerCase();
      let category = "General"; let department = "Municipal Corporation"; let severity = "Low";
      if (lowerDesc.includes('pothole') || lowerDesc.includes('road')) { category = "Road Damage"; department = "PWD"; severity = "High"; }
      else if (lowerDesc.includes('light') || lowerDesc.includes('electricity')) { category = "Electricity"; department = "Electric Department"; severity = "Medium"; }
      else if (lowerDesc.includes('water') || lowerDesc.includes('leak')) { category = "Water Supply"; department = "Water Board"; severity = "Critical"; }
      
      return { 
        category, department, severity, confidence: 98, estimatedSize: "Large", 
        aiSummary: `AI mock summary: Issue revolves around ${category.toLowerCase()} posing a ${severity.toLowerCase()} risk. (Image Processed: ${hasImage})`, 
        resolutionPrediction: "3 Days", isMock: true 
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Analyze the following civic issue complaint (and attached image if provided) and extract the precise details in JSON format exactly as follows:
        {
          "category": "String (e.g. Road Damage, Electricity, Water Supply, Sanitation, Garbage)",
          "department": "String (e.g. PWD, Electric Department, Water Board, Municipal Corporation)",
          "severity": "String (Low, Medium, High, Critical)",
          "confidence": Number (1-100),
          "estimatedSize": "String (Small, Medium, Large) - if applicable",
          "aiSummary": "String (A clean, 1 sentence summary of the issue)",
          "resolutionPrediction": "String (Estimated days, e.g. '3 Days')"
        }
        
        Complaint Description: "${description}"
      `;
      
      const contents: any[] = [{ text: prompt }];

      if (file) {
        // Multi-modal processing: Send the image buffer as Base64 to Gemini
        contents.push({
          inlineData: {
            data: file.buffer.toString("base64"),
            mimeType: file.mimetype
          }
        });
        this.logger.log('Image attached to AI prompt.');
      }
      
      const result = await model.generateContent(contents);
      const output = result.response.text();
      
      // Clean up markdown block if present
      const jsonStr = output.replace(/```json/i, '').replace(/```/i, '').trim();
      const parsed = JSON.parse(jsonStr);
      
      return { ...parsed, isMock: false };
    } catch (e) {
      this.logger.error("Error communicating with Gemini AI:", e);
      return {
        category: "Processing Error",
        department: "Triage",
        severity: "Unknown",
        confidence: 0,
        aiSummary: "Failed to parse complaint description automatically.",
        resolutionPrediction: "Unknown",
        isMock: false
      }
    }
  }

  /**
   * Mock Fake Image / Duplicate detection
   */
  async detectDuplicateOrFake(imageUrl: string, locationLat: number, locationLng: number) {
    return {
      isDuplicate: false,
      isFake: false,
      matchConfidence: 0
    };
  }
}
