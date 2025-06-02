const { cekKuat } = require('../../toolkit/function.js');

module.exports = {
  name: 'Cek kekuatan',
  command: ['cekkekuatan', 'cekkuat'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa kuat orang',
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
      const cek = cekKuat[Math.floor(Math.random() * cekKuat.length)];

      const teks = `Nama: @${mentionTarget}\nKekuatan: ${cek}`

      await conn.sendMessage(chatId, {
        text: teks,
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
}