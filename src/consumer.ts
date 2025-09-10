import { connect, consumeMessage } from "./messaging";

async function main() {
  await connect();

  consumeMessage(async (msg) => {
    console.log(`📥 Recebido vídeo do usuário ${msg.userId}: ${msg.videoPath}`);

    // Simula processamento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`✅ Processamento finalizado: ${msg.videoPath}`);
  });
}

main().catch((err) => console.error("❌ Erro no consumer:", err));
