module.exports = {
  name: 'cekpinter',
  command: ['cekpinter', 'cekpintar', 'cekkepintaran'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa pinter orang',
  prefix: true,
  owner: false,
  isPremium: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isOwner(module.exports, conn, message))) return;
      if (!(await isPrem(module.exports, conn, message))) return;

      let targetId = target(message, senderId);
      const mentionTarget = targetId;
      const persentase = Math.floor(Math.random() * 101);
      let komentar;
      if (persentase <= 25) {
        komentar = 'Gak tolol² amat lah';
      } else if (persentase <= 44) {
        komentar = 'Masih mending';
      } else if (persentase <= 72) {
        komentar = 'Pinter juga lu';
      } else if (persentase <= 88) {
        komentar = 'Tumben pinter';
      } else {
        komentar = 'Orang c*na sih ini!';
      }

      const teks = `*Seberapa pintar* @${mentionTarget}\n\n*${persentase}%* pintar\n_${komentar}_`;

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