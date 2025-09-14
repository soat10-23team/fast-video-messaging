import { SQSClient } from "@aws-sdk/client-sqs";

//export 
export const sqsClient = new SQSClient({
//  region: process.env.AWS_REGION || "us-east-1",
  region: process.env.AWS_REGION,
  endpoint: process.env.SQS_ENDPOINT, // LocalStack
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});