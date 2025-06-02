const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { pinterestHeaders } = require('../../toolkit/scrape/pin');

module.exports = {
  name: 'pinterest',
  command: ['pin', 'pinterest'],
  tags: 'Download Menu',
  desc: 'Mencari media dari pinterest',
  prefix: true,
  isPremium: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isPrem(module.exports, conn, message))) return;
    const query = args.join(' ');
    if (!query) {
      return conn.sendMessage(chatId, { text: `Contoh: ${prefix}${commandText} christy jkt48` }, { quoted: message });
    }

    await conn.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

    try {
      const res = await fetch(`https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
        headers: pinterestHeaders
      });
      const html = await res.text();
      const $ = cheerio.load(html);

      const imageUrls = [];
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && src.startsWith('https://i.pinimg.com')) {
          imageUrls.push(src);
        }
      });

      if (imageUrls.length === 0) {
        return conn.sendMessage(chatId, { text: 'Gambar tidak ditemukan.' }, { quoted: message });
      }

      const index = isNaN(args[1]) ? 0 : Math.min(parseInt(args[1]), imageUrls.length - 1);
      const hasil = imageUrls[index];

      await conn.sendMessage(chatId, {
        image: { url: hasil },
        caption: `Menampilkan gambar ke *${index + 1}* dari *${imageUrls.length}* hasil pencarian *${query}*.`,
        footer: '',
        headerType: 4
      }, { quoted: message });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat scraping.' }, { quoted: message });
    }
  }
};