import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import type { Express } from 'express'; // Types

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image')) // Expects form-data with key 'image'
  async analyzeComplaint(
    @Body('description') description: string,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (!description) {
      description = "No description provided.";
    }
    return this.aiService.analyzeComplaint(description, file);
  }
}
