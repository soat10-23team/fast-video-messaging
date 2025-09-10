import { SQSClient, CreateQueueCommand } from "@aws-sdk/client-sqs";

const QUEUE_NAME = process.env.SQS_QUEUE_NAME || "fast-video-queue";
const REGION = process.env.AWS_REGION || "us-east-1";
const ENDPOINT = process.env.SQS_ENDPOINT; // usado para LocalStack

const sqsClient = new SQSClient({
  region: REGION,
  endpoint: ENDPOINT, // se undefined, usa AWS real
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

async function createQueue() {
  try {
    const command = new CreateQueueCommand({ QueueName: QUEUE_NAME });
    const result = await sqsClient.send(command);
    console.log(`✅ Fila criada ou existente: ${result.QueueUrl}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao criar fila SQS:", err);
    process.exit(1);
  }
}

createQueue();
