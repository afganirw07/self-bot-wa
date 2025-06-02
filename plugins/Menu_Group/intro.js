module.exports = {
  name: 'intro',
  command: ['intro'],
  tags: 'Group Menu',
  desc: 'Mengirimkan intro grup',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, isGroup } = chatInfo;

      if (!isGroup) {
        return conn.sendMessage(chatId, {
          text: '⚠️ Perintah ini hanya dapat digunakan di grup.'
        }, { quoted: message });
      }

      if (!enGcW(chatId)) {
        return conn.sendMessage(chatId, {
          text: '❌ Grup ini tidak terdaftar atau fitur welcome tidak aktif.'
        }, { quoted: message });
      }

      const welcomeText = getWlcTxt(chatId);
      if (!welcomeText || welcomeText.trim() === '' || welcomeText.includes('Selamat datang @user')) {
        return conn.sendMessage(chatId, {
          text: '⚠️ Pesan welcome belum diatur.'
        }, { quoted: message });
      }

      await conn.sendMessage(chatId, {
        text: welcomeText
      }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin intro.js:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: '⚠️ Terjadi kesalahan saat mengirim pesan intro!'
      }, { quoted: message });
    }
  },
};