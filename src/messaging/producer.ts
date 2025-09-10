import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqsClient";

const QUEUE_URL = process.env.SQS_QUEUE_URL || "";

export async function sendMessage(message: any) {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message),
    };

    const result = await sqsClient.send(new SendMessageCommand(params));
    console.log("📤 Mensagem enviada:", result.MessageId);
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err);
  }
}
