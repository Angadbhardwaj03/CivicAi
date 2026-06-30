"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    genAI = null;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.logger.log('Google Generative AI Client Initialized');
        }
        else {
            this.logger.warn('GEMINI_API_KEY is not set. AI Features will fall back to mocked responses.');
        }
    }
    async analyzeComplaint(description, file) {
        this.logger.log(`Analyzing complaint: ${description}`);
        const hasImage = !!file;
        if (!this.genAI) {
            const lowerDesc = description.toLowerCase();
            let category = "General";
            let department = "Municipal Corporation";
            let severity = "Low";
            if (lowerDesc.includes('pothole') || lowerDesc.includes('road')) {
                category = "Road Damage";
                department = "PWD";
                severity = "High";
            }
            else if (lowerDesc.includes('light') || lowerDesc.includes('electricity')) {
                category = "Electricity";
                department = "Electric Department";
                severity = "Medium";
            }
            else if (lowerDesc.includes('water') || lowerDesc.includes('leak')) {
                category = "Water Supply";
                department = "Water Board";
                severity = "Critical";
            }
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
            const contents = [{ text: prompt }];
            if (file) {
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
            const jsonStr = output.replace(/```json/i, '').replace(/```/i, '').trim();
            const parsed = JSON.parse(jsonStr);
            return { ...parsed, isMock: false };
        }
        catch (e) {
            this.logger.error("Error communicating with Gemini AI:", e);
            return {
                category: "Processing Error",
                department: "Triage",
                severity: "Unknown",
                confidence: 0,
                aiSummary: "Failed to parse complaint description automatically.",
                resolutionPrediction: "Unknown",
                isMock: false
            };
        }
    }
    async detectDuplicateOrFake(imageUrl, locationLat, locationLng) {
        return {
            isDuplicate: false,
            isFake: false,
            matchConfidence: 0
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map