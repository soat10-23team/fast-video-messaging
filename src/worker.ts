import { consumeMessages } from "./messaging/consumer";

async function processVideoTask(data: any) {
  console.log("🎬 Processando vídeo:", data.videoPath);
  // aqui entra a lógica com ffmpeg + zip
}

async function startWorker() {
  console.log("👷 Worker iniciado, aguardando mensagens...");

  while (true) {
    await consumeMessages(processVideoTask);
  }
}

startWorker();
