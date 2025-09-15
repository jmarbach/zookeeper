import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Fixed directApiCall to handle different response types
async function directApiCall(endpoint: string, payload: any, method: string = 'POST') {
  const options: RequestInit = {
    method,
    headers: {
      'anchor-api-key': process.env.ANCHOR_API_KEY!,
      'Content-Type': 'application/json',
    },
  };

  if (method !== 'DELETE' && payload) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(`https://api.anchorbrowser.io/v1${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  // Check content type to handle different response formats
  const contentType = response.headers.get('content-type');
  console.log('Response content type:', contentType);
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    // If not JSON, return as text
    const text = await response.text();
    console.log('Non-JSON response:', text.substring(0, 200));
    
    // Try to parse as JSON anyway, in case content-type header is wrong
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Return raw text if JSON parsing fails
      return { content: text, rawResponse: true };
    }
  }
}

// Create session with exact configuration
async function createConfiguredSession() {
  return await directApiCall('/sessions', {
    session: {
      recording: {
        active: true
      },
      proxy: {
        active: true,
        type: 'anchor_residential',
        country_code: 'us'
      },
      timeout: {
        max_duration: 15,  // 15 minutes
        idle_timeout: 1    // 1 minute
      },
      live_view: {
        read_only: false  // Interactive mode
      }
    },
    browser: {
      adblock: {
        active: true
      },
      popup_blocker: {
        active: false
      },
      extra_stealth: {
        active: true
      },
      headless: {
        active: false  // Headless mode inactive
      },
      viewport: {
        width: 1440,
        height: 900
      },
      fullscreen: {
        active: false
      },
      captcha_solver: {
        active: false
      }
    }
  });
}

// Tool 1: Count Tigers
export const tigerCountTool = createTool({
  id: 'count-tigers',
  description: 'Analyze the tiger camera feed to count the number of tigers present',
  inputSchema: z.object({}),
  outputSchema: z.object({
    tigerCount: z.number(),
    confidence: z.string(),
    details: z.string(),
    success: z.boolean(),
  }),
  execute: async () => {
    let sessionId = null;
    
    try {
      const sessionResult = await createConfiguredSession();
      sessionId = sessionResult.data?.id;
      
      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      console.log('Analyzing tiger camera feed...');

      const tigerImageUrl = 'https://zssd-tiger.preview.api.camzonecdn.com/previewimage';
      
      // Use performWebTask for AI vision analysis
      const result = await directApiCall('/tools/perform-web-task', {
        prompt: 'Analyze this image and count the number of tigers visible. Look carefully at the entire image. Return just the number of tigers you can see clearly. Be precise and only count tigers that are clearly visible.',
        url: tigerImageUrl,
        headless: false,
        proxy: {
          active: true,
          type: 'anchor_residential',
          country_code: 'us'
        },
        browser: {
          adblock: {
            active: true
          },
          extra_stealth: {
            active: true
          }
        }
      });

      const analysisResult = result.result || '';
      console.log('Tiger analysis result:', analysisResult);

      // Extract number from AI response
      const numberMatch = analysisResult.match(/(\d+)/);
      const tigerCount = numberMatch ? parseInt(numberMatch[1], 10) : 0;

      return {
        tigerCount,
        confidence: 'High',
        details: analysisResult,
        success: true,
      };
    } catch (error) {
      console.error('Error in tigerCountTool:', error);
      return {
        tigerCount: 0,
        confidence: 'Error',
        details: `Error analyzing tiger image: ${error.message}`,
        success: false,
      };
    } finally {
      if (sessionId) {
        try {
          await directApiCall(`/sessions/${sessionId}`, {}, 'DELETE');
        } catch (cleanupError) {
          console.log('Session cleanup failed:', cleanupError.message);
        }
      }
    }
  },
});

// Tool 2: Count Giraffes
export const giraffeCountTool = createTool({
  id: 'count-giraffes',
  description: 'Analyze the giraffe camera feed to count the number of giraffes present',
  inputSchema: z.object({}),
  outputSchema: z.object({
    giraffeCount: z.number(),
    confidence: z.string(),
    details: z.string(),
    success: z.boolean(),
  }),
  execute: async () => {
    let sessionId = null;
    
    try {
      const sessionResult = await createConfiguredSession();
      sessionId = sessionResult.data?.id;
      
      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      console.log('Analyzing giraffe camera feed...');

      const giraffeImageUrl = 'https://zssd-kijami.preview.api.camzonecdn.com/previewimage';
      
      // Use performWebTask for AI vision analysis
      const result = await directApiCall('/tools/perform-web-task', {
        prompt: 'Analyze this image and count the number of giraffes visible. Look carefully at the entire image. Return just the number of giraffes you can see clearly. Be precise and only count giraffes that are clearly visible.',
        url: giraffeImageUrl,
        headless: false,
        proxy: {
          active: true,
          type: 'anchor_residential',
          country_code: 'us'
        },
        browser: {
          adblock: {
            active: true
          },
          extra_stealth: {
            active: true
          }
        }
      });

      const analysisResult = result.result || '';
      console.log('Giraffe analysis result:', analysisResult);

      // Extract number from AI response
      const numberMatch = analysisResult.match(/(\d+)/);
      const giraffeCount = numberMatch ? parseInt(numberMatch[1], 10) : 0;

      return {
        giraffeCount,
        confidence: 'High',
        details: analysisResult,
        success: true,
      };
    } catch (error) {
      console.error('Error in giraffeCountTool:', error);
      return {
        giraffeCount: 0,
        confidence: 'Error',
        details: `Error analyzing giraffe image: ${error.message}`,
        success: false,
      };
    } finally {
      if (sessionId) {
        try {
          await directApiCall(`/sessions/${sessionId}`, {}, 'DELETE');
        } catch (cleanupError) {
          console.log('Session cleanup failed:', cleanupError.message);
        }
      }
    }
  },
});

// Combined tool for complete safari analysis
export const animalWatchTool = createTool({
  id: 'animal-watch-tool',
  description: 'Get complete count of animals in the safari park by analyzing both camera feeds',
  inputSchema: z.object({}),
  outputSchema: z.object({
    giraffes: z.number(),
    tigers: z.number(),
    totalAnimals: z.number(),
    report: z.string(),
    success: z.boolean(),
  }),
  execute: async () => {
    try {
      console.log('Starting complete safari animal count...');

      // Count tigers
      const tigerResult = await tigerCountTool.execute({});
      console.log('Tiger count result:', tigerResult);

      // Count giraffes  
      const giraffeResult = await giraffeCountTool.execute({});
      console.log('Giraffe count result:', giraffeResult);

      const giraffes = giraffeResult.giraffeCount || 0;
      const tigers = tigerResult.tigerCount || 0;
      const totalAnimals = giraffes + tigers;

      const report = `Safari Park Animal Count Report:
- Giraffes: ${giraffes} (${giraffeResult.confidence} confidence)
- Tigers: ${tigers} (${tigerResult.confidence} confidence)
- Total Animals: ${totalAnimals}

Details:
Tiger Analysis: ${tigerResult.details}
Giraffe Analysis: ${giraffeResult.details}`;

      return {
        giraffes,
        tigers,
        totalAnimals,
        report,
        success: tigerResult.success && giraffeResult.success,
      };
    } catch (error) {
      console.error('Error in animalWatchTool:', error);
      return {
        giraffes: 0,
        tigers: 0,
        totalAnimals: 0,
        report: `Error during safari analysis: ${error.message}`,
        success: false,
      };
    }
  },
});

// Test tool
export const testTool = createTool({
  id: 'test-session-approach',
  description: 'Test session-based fetch webpage approach with correct query param',
  inputSchema: z.object({
    testUrl: z.string().optional(),
  }),
  outputSchema: z.object({
    status: z.string(),
    message: z.string(),
    sessionId: z.string().optional(),
  }),
  execute: async ({ context }) => {
    let sessionId = null;
    
    try {
      const sessionResult = await createConfiguredSession();
      sessionId = sessionResult.data?.id;
      
      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      console.log('Created session:', sessionId);

      const testUrl = context.testUrl || 'https://httpbin.org/ip';
      const result = await directApiCall(`/tools/fetch-webpage?sessionId=${sessionId}`, {
        url: testUrl,
        format: 'markdown'
      });

      return {
        status: 'SUCCESS',
        message: `Session approach worked! Content length: ${result.content?.length || 'unknown'}`,
        sessionId: sessionId,
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Session approach failed: ${error.message}`,
        sessionId: sessionId || 'none',
      };
    } finally {
      if (sessionId) {
        try {
          await directApiCall(`/sessions/${sessionId}`, {}, 'DELETE');
          console.log('Session cleaned up:', sessionId);
        } catch (cleanupError) {
          console.log('Session cleanup failed:', cleanupError.message);
        }
      }
    }
  },
});
