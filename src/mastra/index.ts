import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { safariMonitoringWorkflow } from './workflows';
import { zookeeperAgent } from './agents';

export const mastra = new Mastra({
  workflows: { safariMonitoringWorkflow },
  agents: { zookeeperAgent },
  telemetry: {
    instrumentation: {
      disabled: true
    }
  },
  logger: new PinoLogger({
    name: 'ZookeeperAgent',
    level: 'info',
  }),
});
