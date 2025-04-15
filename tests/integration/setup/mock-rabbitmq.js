const messages = [];

export function mockRabbitMQ() {
  return {
    sendToQueue: (queue, message) => {
      messages.push(JSON.parse(message));
    },
    close: () => {
      messages.length = 0;
    },
  };
}

export function getPublishedMessages() {
  return messages;
}
