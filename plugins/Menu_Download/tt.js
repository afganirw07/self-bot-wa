const { getTiktokVideo } = require('../../toolkit/scrape/tiktok.js');

module.exports = {
  name: 'tiktok',
  command: ['tiktok', 'tt'],
  tags: 'Download Menu',
  desc: 'Download video dari TikTok tanpa watermark.',
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
    if (!args[0]) {
      return conn.sendMessage(chatId, { text: `Example:\n${prefix}${commandText} https://vt.tiktok.com/7494086723190721798/` }, { quoted: message });
    }

    if (!args[0].includes('tiktok.com')) {
      return conn.sendMessage(chatId, { text: `Link yang kamu kirim tidak valid.` }, { quoted: message });
    }

    await conn.sendMessage(chatId, { react: { text: '🕒', key: message.key } });

    try {
      const result = await getTiktokVideo(args[0]);

      let text = `T I K T O K - D O w N L O A D\n`;
      text += `\n${head}\n`;
      text += `${side} ${btn} *Title* : ${result.title}\n`;
      text += `${side} ${btn} *User* : ${result.author.nickname} (@${result.author.unique_id})\n`;
      text += `${side} ${btn} *Durasi* : ${result.duration}s\n`;
      text += `${side} ${btn} *Likes* : ${result.digg_count.toLocaleString()}\n`;
      text += `${side} ${btn} *Views* : ${result.play_count.toLocaleString()}\n`;
      text += `${side} ${btn} *Shares* : ${result.share_count.toLocaleString()}\n`;
      text += `${side} ${btn} *Comments* : ${result.comment_count.toLocaleString()}\n`;
      text += `${side} ${btn} *Download* : Tanpa Watermark\n`;
      text += `${foot}${garis}`

      await conn.sendMessage(chatId, {
        video: { url: 'https://tikwm.com' + result.play },
        caption: text
      }, { quoted: message, ephemeralExpiration: message.expiration });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Maaf, terjadi kesalahan saat memproses video.' }, { quoted: message });
    }
  }
}