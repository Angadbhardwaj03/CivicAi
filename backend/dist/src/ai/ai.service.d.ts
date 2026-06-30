export declare class AiService {
    private readonly logger;
    private genAI;
    constructor();
    analyzeComplaint(description: string, file?: Express.Multer.File): Promise<any>;
    detectDuplicateOrFake(imageUrl: string, locationLat: number, locationLng: number): Promise<{
        isDuplicate: boolean;
        isFake: boolean;
        matchConfidence: number;
    }>;
}
