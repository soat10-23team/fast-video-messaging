import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqsClient";

const QUEUE_URL = process.env.SQS_QUEUE_URL || "";

export async function consumeMessages(callback: (msg: any) => Promise<void>) {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 20, // long polling
    };

    const result = await sqsClient.send(new ReceiveMessageCommand(params));

    if (result.Messages) {
      for (const message of result.Messages) {
        if (message.Body) {
          const data = JSON.parse(message.Body);
          await callback(data);

          // apaga da fila após processar
          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle!,
            })
          );
          console.log("✅ Mensagem processada e removida:", message.MessageId);
        }
      }
    }
  } catch (err) {
    console.error("❌ Erro ao consumir mensagens:", err);
  }
}
