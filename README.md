# 📦 fast-video-messaging

Serviço de mensageria para o sistema **Fast Video Processing**.  
Gerencia o envio e consumo de mensagens de processamento de vídeo via AWS SQS (ou LocalStack para testes locais).
---

## 🚀 Tecnologias
- Node.js ^22.10.5
- TypeScript
- AWS SQS / LocalStack
- Jest (testes unitários)
- Docker / Docker Compose

---

## 📂 Estrutura

fast-video-messaging/
├── src/                # Código-fonte TypeScript
│   ├── api.ts          # API HTTP para envio/consulta de mensagens
│   ├── send.ts         # Script para enviar mensagem manualmente
│   ├── consumer.ts     # Script para consumir mensagem manualmente
│   └── messaging.ts    # Conexão com SQS + helpers
├── dist/               # Código compilado JS (após tsc)
├── tests/              # Testes unitários Jest
│   └── messaging.spec.ts
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md


---

## ▶️ Como Rodar
## 1.0docker compose up -d localstack

### 1.1. LocalStack / Ambiente Local

```bash
docker compose up -d localstack
```
Painel de serviços: http://localhost:4566

### 1.2. Criar a fila no LocalStack:

```bash
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name video_processing --region us-east-1
```

### 1.3 Instalar dependências:
```bash
npm install
```
### 1.4 Rodar API:
```bash
npm run api
```
### 1.5 Enviar mensagem de teste:
```bash
npm run send
```
### 1.6 Consumir mensagem:
```bash
npm run consume
```
### 1.7 Rodar testes unitários:
```bash
npm test
```


### 2. Produção AWS
### 2.1 Configurar credenciais:

```bash
aws configure
```

### 2.2 Definir variáveis de ambiente:
export AWS_REGION=us-east-1
export SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/<account-id>/video_processing

### 2.3 Subir API:
```bash
npm run api
```



## 🔗 Fila e Mensagem

### Estrutura da Mensagem (JSON):

Queue: video_processing

| Campo      | Tipo   | Obrigatório | Descrição                                  |
| ---------- | ------ | ----------- | ------------------------------------------ |
| videoPath  | string | sim         | Caminho do vídeo (no volume compartilhado) |
| status     | string | sim         | PENDENTE, CONCLUIDO, FALHA                 |
| outputName | string | não         | Nome do ZIP gerado pelo worker             |



Exemplos:


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


** ⚠️ Nota: devido às limitações do SQS, não é possível consultar uma mensagem específica por ID.
GET /messages retorna apenas as mensagens visíveis na fila no momento. **


**documentação dos contratos entre os microsserviços**.

Como temos **3 serviços** (`gateway`, `worker`, `messaging`), os contratos ficam em dois níveis:

1. **API HTTP (gateway ↔ cliente)**
2. **Mensageria (gateway ↔ worker via RabbitMQ)**
3. **Volumetria de arquivos (storage compartilhado em volumes)**

---

# 📄 Contratos de Comunicação

## 🔹 1. API HTTP – Gateway

Endpoints REST para enviar ou consultar mensagens.

### `POST /messages`

**Descrição:** Envia uma mensagem de processamento de vídeo

* **Request** Body (JSON):

```json
{
  "videoPath": "/app/uploads/video123.mp4",
  "status": "PENDENTE",
  "outputName": null
}
```
* **Response** 201 Created

```json
{
  "messageId": "abc123"
}
```

* **Erros:**

  * `400 Bad Request` → Nenhum arquivo enviado
  * `500 Internal Server Error` → Erro ao enviar mensagem

### `GET /messages`

**Descrição:** Lista mensagens visíveis na fila

  * `500 Internal Server Error` → Erro ao listar mensagens



### `DELETE /messages`

**Descrição:** Consome a primeira mensagem visível da fila e deleta

* **Response** 200 OK

```json
{
  "status": "Mensagem consumida e deletada",
  "message": { "videoPath": "/app/uploads/video123.mp4", "status": "PENDENTE", "outputName": null }
}

```

* **Erros:**

  * `500 Internal Server Error` → Erro ao listar mensagens



---

# 🔹 2. Fluxo Resumido

1. Cliente faz `POST /messages` (envia vídeo).
2. Gateway salva o vídeo em `/uploads` e publica mensagem no AWS SQS (ou LocalStack para testes locais).
3. Worker consome a mensagem `DELETE /messages` , processa com `ffmpeg`, gera frames, cria `.zip` em `/outputs`.
4. Cliente faz `GET /messages/{file}` para baixar o resultado.

---
