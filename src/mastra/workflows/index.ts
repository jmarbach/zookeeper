// src/mastra/workflows/index.ts
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

export const safariMonitoringWorkflow = createWorkflow({
  name: 'Safari Park Animal Monitoring',
  triggerSchema: z.object({
    scheduleCheck: z.boolean().optional(),
  }),
  steps: {
    // Step 1: Count Tigers
    countTigers: {
      tool: 'tigerCountTool',
      outputSchema: z.object({
        tigerCount: z.number(),
        confidence: z.string(),
        details: z.string(),
        success: z.boolean(),
      }),
    },
    
    // Step 2: Count Giraffes  
    countGiraffes: {
      tool: 'giraffeCountTool',
      outputSchema: z.object({
        giraffeCount: z.number(),
        confidence: z.string(), 
        details: z.string(),
        success: z.boolean(),
      }),
    },
    
    // Step 3: Generate Report
    generateReport: {
      inputSchema: z.object({
        tigerData: z.object({
          tigerCount: z.number(),
          confidence: z.string(),
          details: z.string(),
          success: z.boolean(),
        }),
        giraffeData: z.object({
          giraffeCount: z.number(),
          confidence: z.string(),
          details: z.string(), 
          success: z.boolean(),
        }),
      }),
      outputSchema: z.object({
        report: z.string(),
        totalAnimals: z.number(),
        timestamp: z.string(),
      }),
      func: async ({ tigerData, giraffeData }) => {
        const timestamp = new Date().toISOString();
        const totalAnimals = tigerData.tigerCount + giraffeData.giraffeCount;
        
        const report = `
Safari Park Monitoring Report
Generated: ${timestamp}

Animal Counts:
- Giraffes: ${giraffeData.giraffeCount} (${giraffeData.confidence} confidence)
- Tigers: ${tigerData.tigerCount} (${tigerData.confidence} confidence)
- Total Animals: ${totalAnimals}

Camera Feed Analysis:
Tiger Camera: ${tigerData.details}
Giraffe Camera: ${giraffeData.details}

Status: ${tigerData.success && giraffeData.success ? 'All cameras operational' : 'Some camera issues detected'}
        `.trim();

        return {
          report,
          totalAnimals,
          timestamp,
        };
      },
    },
  },
});
