import { SQSClient, type SQSClientConfig, SendMessageCommand } from '@aws-sdk/client-sqs';
import { env } from '@/infra/config/env';

export class SQSService {
  private sqs: SQSClient;

  constructor() {
    const config = {
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    } as SQSClientConfig

    if (env.NODE_ENV === "development") {
      config["endpoint"] = env.AWS_ENDPOINT;
      config["useQueueUrlAsEndpoint"] = true;
      config["forcePathStyle"] = true;
    }
    this.sqs = new SQSClient(config);
  }

  async sendMessage(queueUrl: string, message: any, delaySeconds?: number) {
    console.log("queueUrl: ", queueUrl)
    const messageBody = typeof message === 'string' ? message : JSON.stringify(message);

    const params = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    };

    return this.sqs.send(new SendMessageCommand(params));
  }
} 