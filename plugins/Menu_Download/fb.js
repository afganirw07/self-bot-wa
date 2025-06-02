const facebook = require("../../toolkit/scrape/facebook");

module.exports = {
  name: 'facebook',
  command: ['fb', 'fbdl', 'facebook'],
  tags: 'Download Menu',
  desc: 'Mendownload media dari Facebook',
  prefix: true,
  isPremium: true,

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
      return conn.sendMessage(chatId, {
        text: `🚨 *Format salah!*\nGunakan: *${prefix}${commandText} <url>*`
      }, { quoted: message });
    }

    const url = args[0];

    if (!/facebook\.\w+\/(reel|watch|share)/gi.test(url)) {
      return conn.sendMessage(chatId, {
        text: `❌ *Masukkan URL Facebook yang valid!*`
      }, { quoted: message });
    }

    try {
      await conn.sendMessage(chatId, { react: { text: "🕒", key: message.key } });

      const videoData = await facebook(url);

      if (!videoData || !videoData.video.length) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Gagal mengambil video! Pastikan link valid dan publik.*"
        }, { quoted: message });
      }

      const bestQualityVideo = videoData.video[0]?.url;
      if (!bestQualityVideo) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Video tidak ditemukan atau tidak dapat diunduh!*"
        }, { quoted: message });
      }

      const caption = `🎬 *Video Facebook Ditemukan!*\n\n📌 *Judul*: ${videoData.title || "Tidak diketahui"}\n⏳ *Durasi*: ${videoData.duration || "Tidak diketahui"}`;

      await conn.sendMessage(chatId, {
        image: { url: videoData.thumbnail },
        caption,
      }, { quoted: message });

      await conn.sendMessage(chatId, {
        video: { url: bestQualityVideo },
        caption: "✅ *Berikut videonya!*"
      }, { quoted: message });
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, {
        text: "⚠️ *Terjadi kesalahan, coba lagi nanti!*"
      }, { quoted: message });
    }
  },
};