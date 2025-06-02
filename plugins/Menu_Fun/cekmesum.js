module.exports = {
  name: 'cek mesum',
  command: ['cekmesum'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa mesum orang',
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
      const persentase = Math.floor(Math.random() * 101);

      let komentar;
      if (persentase <= 25) {
        komentar = 'Masih mending';
      } else if (persentase <= 44) {
        komentar = 'Waduh ini sih udah';
      } else if (persentase <= 72) {
        komentar = 'Parah sih ini';
      } else if (persentase <= 88) {
        komentar = 'Cabul bet';
      } else {
        komentar = 'Hati-hati orang cabul';
      }

      const teks = `*seberapa cabul* @${mentionTarget}\n\n*${persentase}%* Cabul\n_${komentar}_`

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