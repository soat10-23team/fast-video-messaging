import amqp, { Channel } from "amqplib";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";


let channel: Channel;
const queue = "processar_arquivos";

export async function connect() {
  const connection = await amqp.connect(RABBITMQ_URL); // hostname do docker-compose
  channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });
  console.log("✅ Conectado ao RabbitMQ");
}

export function sendMessage(msg: any) {
  if (!channel) throw new Error("Canal RabbitMQ não inicializado.");
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
  console.log("📤 Mensagem enviada:", msg.videoPath);
}

export function consumeMessage(callback: (msg: any) => Promise<void>) {
  if (!channel) throw new Error("Canal RabbitMQ não inicializado.");
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      await callback(data);
      channel.ack(msg);
    }
  });
}
