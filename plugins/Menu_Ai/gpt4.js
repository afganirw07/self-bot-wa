const gpt4 = require('../../toolkit/scrape/gpt4');

module.exports = {
  name: 'gpt4o',
  command: ['gpt4o', 'gpt4'],
  tags: 'Ai Menu',
  desc: 'Tanya ke GPT-4o menggunakan ChatGPT4o.one',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!textMessage) {
        return conn.sendMessage(chatId, { text: '❌ Apa yang ingin kamu tanyakan?' }, { quoted: message });
      }

      const response = await gpt4(textMessage);
      if (!response) {
        return conn.sendMessage(chatId, { text: '❌ Gagal mendapatkan respon.' }, { quoted: message });
      }

      conn.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, { text: '❌ Terjadi kesalahan saat memproses permintaan.' }, { quoted: message });
    }
  }
};