import { sendMessage, consumeMessages } from "../src/messaging";

describe("RabbitMQ Messaging", () => {
  it("should send and consume a message", async () => {
    const testMessage = { videoId: "test123", userId: "testUser" };

    await sendMessage(testMessage);

    await new Promise<void>((resolve) => {
      consumeMessages((msg) => {
        expect(msg).toEqual(testMessage);
        resolve();
      });
    });
  });
});
