const { igdl } = require('ruhend-scraper');

module.exports = {
  name: 'instagram',
  command: ['instagram', 'ig', 'igdl', 'instegrem', 'insta'],
  tags: 'Download Menu',
  desc: 'Mengunduh video atau foto dari Instagram',
  prefix: true,
  isPremium: true,

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

      if (!args) {
        return conn.sendMessage(chatId, { text: `Masukkan URL Instagram! Contoh: *${prefix}${commandText} https://www.instagram.com/p/C1Ck8sENM94/*` }, { quoted: message });
      }

      const url = Array.isArray(args) ? args[0] : args;
      if (!url || !url.match(/(https?:\/\/(?:www\.)?instagram\.[a-z\.]{2,6}\/[\w\-\.]+(\/[^\s]*)?)/g)) {
        return conn.sendMessage(chatId, { text: 'URL tidak valid! Pastikan itu adalah tautan Instagram.' }, { quoted: message });
      }

      await conn.sendMessage(chatId, { text: '⏳ Sedang memproses, mohon tunggu...' }, { quoted: message });

      const res = await igdl(url);
      const data = res.data;

      if (!data || data.length === 0) {
        return conn.sendMessage(chatId, { text: 'Media tidak ditemukan atau URL salah.' }, { quoted: message });
      }

      const media = data[0];
      const fileName = `${media.title?.replace(/[\/:*?"<>|]/g, '') || 'instagram_1'}.mp4`;
      const caption = media.description || 'Video Instagram';

      await conn.sendMessage(chatId, {
        video: { url: media.url },
        mimetype: 'video/mp4',
        fileName,
        caption
      }, { quoted: message });

    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, { text: 'Terjadi kesalahan saat memproses permintaan. Coba lagi nanti!' }, { quoted: message });
    }
  }
}