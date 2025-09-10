import { connect, sendMessage } from "./messaging";

async function main() {
  await connect();

  // Exemplo de mensagens simulando vídeos
  const videos = [
    { videoPath: "uploads/video1.mp4", userId: 101 },
    { videoPath: "uploads/video2.mp4", userId: 102 },
    { videoPath: "uploads/video3.mp4", userId: 103 },
  ];

  for (const video of videos) {
    sendMessage(video);
  }

  console.log("✅ Todas as mensagens foram enviadas!");
}

main().catch((err) => console.error("❌ Erro no producer:", err));
