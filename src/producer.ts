import { connect, sendMessage } from "./messaging";

async function main() {
  await connect();

  // Exemplo de mensagens simulando vídeos
  const videos = [
    { videoPath: "/app/uploads/abcd1234.mp4", status: "PENDENTE", outputName: null, userId: 101 },
    { videoPath: "/app/uploads/abcd1234.mp4", status: "CONCLUIDO", outputName:"1735689963_frames.zip", userId: 101 },
    { videoPath: "/app/uploads/abcd1234.mp4", status: "FALHA", outputName:null, userId: 101 }
  ];

  for (const video of videos) {
    sendMessage(video);
  }

  console.log("✅ Todas as mensagens foram enviadas!");
}

main().catch((err) => console.error("❌ Erro no producer:", err));
