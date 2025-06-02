const { sifatlist } = require('../../toolkit/function.js');

module.exports = {
  name: 'ceksifat',
  command: ['ceksifat'],
  tags: 'Fun Menu',
  desc: 'Menebak sifat seseorang',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      let targetId = target(message, senderId);
      const mentionTarget = targetId;
      const sifat = sifatlist[Math.floor(Math.random() * sifatlist.length)];

      await conn.sendMessage(chatId, {
        text: `Nama: @${mentionTarget}\nSifat: ${sifat}`,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
};