import express from "express";
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand} from "@aws-sdk/client-sqs";

const app = express();
app.use(express.json());

const client = new SQSClient({
  region: "us-east-1",
  endpoint: process.env.AWS_SQS_ENDPOINT || "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

const QUEUE_URL =
  process.env.SQS_QUEUE_URL || "http://localhost:4566/000000000000/video_processing";

// POST -> envia mensagem para fila
app.post("/messages", async (req, res) => {
  try {
    const { videoPath, status, outputName} = req.body;

    if (!videoPath) {
      return res.status(400).json({ error: "Campo 'videoPath' é obrigatório" });
    }

    const command = new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({ videoPath, status, outputName }),
    });

    const result = await client.send(command);
    return res.status(201).json({ messageId: result.MessageId });
  } catch (err: any) {
    console.error("❌ Erro ao enviar mensagem:", err);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// GET -> lista mensagens da fila (sem deletar)
app.get("/messages", async (_req, res) => {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 1,
      VisibilityTimeout: 1 // segundos
    });

    const response = await client.send(command);
    
    return res.json({ messages: response.Messages || [] });
  } catch (err: any) {
    console.error("❌ Erro ao listar mensagens:", err);
    res.status(500).json({ error: "Erro ao listar mensagens" });
  }
});

// GET -> uma mensagens da fila (sem deletar)
app.get("/messages/:id", async (_req, res) => {
  try {
    const { id } = _req.params;
    const command = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 1,
      VisibilityTimeout: 1 // segundos
    });

    const response = await client.send(command);
    const msg = response.Messages?.find(m => m.MessageId === id);

    if (!msg) return res.status(404).json({ message: "Mensagem não encontrada" });
  
    res.json({ message: JSON.parse(msg.Body!) });
    
    return res.json({ messages: msg.Body || [] });
    
  } catch (err: any) {
    console.error("❌ Erro ao listar mensagens:", err);
    res.status(500).json({ error: "Erro ao listar mensagens" });
  }
});


// DELETE /messages -> consome a primeira mensagem da fila e apaga
app.delete("/messages", async (_req, res) => {
  try {
    const receiveCmd = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 1,
      VisibilityTimeout: 1 // segundos
    });

    const response = await client.send(receiveCmd);

    if (!response.Messages || response.Messages.length === 0) {
      return res.status(404).json({ message: "Nenhuma mensagem na fila" });
    }

    const msg = response.Messages[0];
    const body = msg.Body ? JSON.parse(msg.Body) : {};

    console.log("📩 Consumindo mensagem:", body);

    // Deleta a mensagem da fila
    const deleteCmd = new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: msg.ReceiptHandle!,
    });

    await client.send(deleteCmd);

    res.json({ status: "Mensagem consumida e deletada", message: body });
  } catch (err) {
    console.error("❌ Erro ao consumir mensagem:", err);
    res.status(500).json({ error: "Erro ao consumir mensagem" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API de mensageria rodando em http://localhost:${PORT}`));




