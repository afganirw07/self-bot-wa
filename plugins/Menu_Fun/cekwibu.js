module.exports = {
  name: 'Cek wibu',
  command: ['cekwibu', 'cek wibu'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa wibu orang',
  prefix: true,
  isPremium: false,
  owner: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, message))) return;
      if (!(await isOwner(module.exports, conn, message))) return;
      const targetId = target(message, senderId);
      const mentionTarget = targetId;
      const persentase = Math.floor(Math.random() * 101);

      let komentar;
      if (persentase <= 25) {
        komentar = 'Masih aman tapi karbit';
      } else if (persentase <= 44) {
        komentar = 'Lumayan lah bukan fomo';
      } else if (persentase <= 72) {
        komentar = 'Kalo ini sih gangguan jiwa';
      } else if (persentase <= 88) {
        komentar = 'Fiks wibu bau bawang';
      } else {
        komentar = 'Aduh udah gila ini mah';
      }

      const teks = `Seberapa wibu @${mentionTarget}\n\n*${persentase}%* Wibu\n_${komentar}_`;

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