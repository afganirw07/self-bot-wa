const { cekKhodam } = require('../../toolkit/function.js');

module.exports = {
  name: 'CekKhodam',
  command: ['cekkodam', 'cekkhodam'],
  tags: 'Fun Menu',
  desc: 'Cek kodam pengguna',
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

      const cek = cekKhodam[Math.floor(Math.random() * cekKhodam.length)];
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      const teks = `_Pengecekan Khodam untuk @${mentionTarget}⁩ telah berhasil_!\n\nSetelah melalui penelusuran spiritual yang mendalam, diketahui bahwa Khodam yang mendampingi @${mentionTarget} adalah *${cek}*`;

      const teks2 = `Bentar tak terawang dulu...`;

      conn.sendMessage(chatId, {
        text: teks2,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });

      await delay(3000);
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