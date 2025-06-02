module.exports = {
  name: 'topyapping',
  command: ['topyapping', 'yapping'],
  tags: 'Fun Menu',
  desc: 'Tag 10 anggota grup secara acak sebagai yapping',
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
      const targetId = target(message, senderId);
      const mentionTarget = targetId;

      if (!isGroup) {
        return await conn.sendMessage(chatId, {
          text: 'Perintah ini hanya bisa digunakan di grup.'
        }, { quoted: message });
      }

      const metadata = await conn.groupMetadata(chatId);
      const participants = metadata.participants
        .filter(p => !p.id.includes('g.us'))
        .map(p => p.id);

      if (participants.length < 1) {
        return await conn.sendMessage(chatId, {
          text: 'Tidak ada peserta untuk di-tag.'
        }, { quoted: message });
      }

      const shuffled = participants.sort(() => 0.5 - Math.random());
      const topYapping = shuffled.slice(0, 10);

      let teks = `*Top besar Yapping di grup:*\n\n`;
      topYapping.forEach((id, i) => {
        const nomor = id.split('@')[0];
        teks += `${i + 1}. @${nomor}\n`;
      });

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: topYapping
      }, { quoted: message });

    } catch (e) {
      console.error('Error di plugin topyapping:', e);
      await conn.sendMessage(chatId, {
        text: 'Terjadi kesalahan saat menjalankan perintah.'
      }, { quoted: message });
    }
  }
};