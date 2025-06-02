const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'close',
  command: ['close', 'tutup'],
  tags: 'Group Menu',
  desc: 'Menutup chat group WhatsApp',
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
      if (!isGroup) {
        return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
      }

      const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

      if (!userAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
      }

      if (!botAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });
      }

      await conn.groupSettingUpdate(chatId, 'announcement');
      conn.sendMessage(chatId, { text: '🔒 Grup telah ditutup! Sekarang hanya admin yang bisa mengirim pesan.' }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal menutup grup. Coba lagi nanti.' }, { quoted: message });
    }
  }
};