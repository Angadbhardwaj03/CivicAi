import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    analyzeComplaint(description: string, file?: Express.Multer.File): Promise<any>;
}
