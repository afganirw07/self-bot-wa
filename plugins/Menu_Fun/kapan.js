const { when } = require('../../toolkit/function.js');

module.exports = {
  name: 'kapan',
  command: ['kapan yah', 'kapan'],
  tags: 'Fun Menu',
  desc: 'Sambung kata dengan bot',
  prefix: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const kapan = when[Math.floor(Math.random() * when.length)];

      await conn.sendMessage(chatId, { text: kapan }, { quoted: message });

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
}