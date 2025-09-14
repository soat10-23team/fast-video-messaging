import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const client = new SQSClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

const QUEUE_URL = "http://localhost:4566/000000000000/video_processing";

async function main() {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({ videoPath: "video-manual.mp4" }),
  });

  const result = await client.send(command);
  console.log("📤 Mensagem enviada com sucesso:", result.MessageId);
}

main().catch(console.error);
