# 📦 fast-video-messaging

Serviço de mensageria para o sistema **Fast Video Processing**.  
Gerencia o envio e consumo de mensagens de processamento de vídeo via RabbitMQ.

---

## 🚀 Tecnologias
- Node.js ^22.10.5
- TypeScript
- RabbitMQ
- Jest (testes)
- Docker / Docker Compose

---

## 📂 Estrutura

fast-video-messaging/
├── src/
│   ├── messaging.ts      # Conexão RabbitMQ + helpers
│   ├── producer.ts       # Producer fake para testes manuais
│   ├── consumer.ts       # Consumer fake para testes manuais
│   └── index.ts          # (opcional) ponto de entrada
├── tests/
│   └── messaging.spec.ts # Testes automatizados com Jest
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md


---

## ▶️ Como Rodar

### 1. Subir RabbitMQ
```bash
docker compose up -d
Acesse o painel: http://localhost:15672
```

### 2. Instalar dependências
npm install

### 3. Rodar producer
npm run start:producer

### 4. Rodar consumer
npm run start:consumer

### 5. Rodar testes
npm test

## 🔗 Fila e Mensagem

Queue: video_processing
### Estrutura da Mensagem (JSON):

```json
{
  "videoPath": "/app/uploads/abcd1234.mp4",
  "status": "PENDENTE", 
  "outputName": null
}
```
```json
{
  "videoPath": "/app/uploads/abcd1234.mp4",
  "status": "CONCLUIDO", 
  "outputName": "1735689963_frames.zip"
}
```
```json
{
  "videoPath": "/app/uploads/abcd1234.mp4",
  "status": "FALHA", 
  "outputName": null
}
```

**documentação dos contratos entre os microsserviços**.

Como temos **3 serviços** (`gateway`, `worker`, `messaging`), os contratos ficam em dois níveis:

1. **API HTTP (gateway ↔ cliente)**
2. **Mensageria (gateway ↔ worker via RabbitMQ)**
3. **Volumetria de arquivos (storage compartilhado em volumes)**

---

# 📄 Contratos de Comunicação

## 🔹 1. API HTTP – Gateway

O **gateway** expõe os endpoints REST para o cliente (frontend ou outro consumidor).

### `POST /upload`

**Descrição:** Recebe um vídeo para processamento.

* **Request** (Multipart/form-data):

  * `video` → arquivo de vídeo (ex.: `.mp4`, `.mov`)

* **Response** (JSON):

```json
{
  "message": "Vídeo recebido e enviado para processamento.",
  "status": "CONCLUIDO", 
  "file": "1735689963_frames.zip"
}
```

* **Erros:**

  * `400 Bad Request` → Nenhum arquivo enviado
  * `500 Internal Server Error` → Falha ao publicar mensagem no RabbitMQ

---

### `GET /download/{file}`

**Descrição:** Faz o download do ZIP gerado pelo worker.

* **Path param:** `file` → nome do arquivo zip (ex.: `1735689963_frames.zip`)

* **Response:**

  * `200 OK` → Retorna o arquivo `.zip` em `application/zip`
  * `404 Not Found` → Arquivo ainda não processado ou inexistente

---

## 🔹 2. Contrato de Mensageria – Gateway ↔ Worker

A comunicação assíncrona ocorre via **RabbitMQ** (fila: `video_processing`).
O **gateway** publica mensagens e o **worker** consome.

### Estrutura da Mensagem (JSON):

```json
{
  "videoPath": "/app/uploads/abcd1234.mp4",
  "outputName": "1735689963_frames.zip"
}
```

* **Campos:**

  * `videoPath` *(string, obrigatório)* → caminho do arquivo enviado no volume compartilhado
  * `outputName` *(string, obrigatório)* → nome do zip que será gerado pelo worker

* **Garantias:**

  * Mensagens persistentes (`persistent: true`) → não se perdem em restart do RabbitMQ
  * Worker confirma (`ack`) apenas após gerar o `.zip` com sucesso

---

## 🔹 3. Volumes Compartilhados – Gateway ↔ Worker

Os serviços não transferem arquivos via rede, apenas metadados.
Os binários grandes (vídeos, zips) ficam em volumes Docker compartilhados.

### Estrutura de diretórios:

```
/app/uploads   → vídeos recebidos pelo gateway
/app/temp      → frames extraídos pelo worker
/app/outputs   → arquivos zip prontos para download
```

* **Workflow de arquivos:**

  1. `gateway` salva vídeo em `/app/uploads/...`
  2. `gateway` envia mensagem `{ videoPath, outputName }`
  3. `worker` lê o vídeo, gera frames em `/app/temp/`
  4. `worker` compacta frames em `/app/outputs/outputName.zip`
  5. `gateway` libera o download em `/download/{outputName}`

---

# 🔹 Fluxo Resumido

1. Cliente faz `POST /upload` (envia vídeo).
2. Gateway salva o vídeo em `/uploads` e publica mensagem no RabbitMQ.
3. Worker consome a mensagem, processa com `ffmpeg`, gera frames, cria `.zip` em `/outputs`.
4. Cliente faz `GET /download/{file}` para baixar o resultado.

---
