const { ask } = require('../../toolkit/function.js');

module.exports = {
  name: 'Tanya jawab',
  command: ['apakah', 'Apakah', 'Bukan kah', 'Bukankah', 'Benarkah', 'Benar kah', 'bukan kah', 'bukankah', 'benarkah', 'benar kah'],
  tags: 'Fun Menu',
  desc: 'Bertanya kepada bot',
  prefix: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const tanya = ask[Math.floor(Math.random() * ask.length)];

      await conn.sendMessage(chatId, { text: tanya }, { quoted: message });

    } catch (error) {
      console.error('Error:', error);
      await conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
}