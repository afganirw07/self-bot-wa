const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'listisPrem',
  command: ['listprem', 'listisPremium'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar pengguna isPremium.',
  prefix: true,
  owner: true,

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

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: '⚠️ Database tidak ditemukan!' }, { quoted: message });
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database Private tidak valid!' }, { quoted: message });
      }

      const isPremiumUsers = Object.entries(db.Private)
        .filter(([_, data]) => data.isPremium?.isPrem === true)
        .map(([name, data]) => ({
          name,
          number: data.Nomor,
          time: data.isPremium.time,
        }));

      if (isPremiumUsers.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Saat ini tidak ada pengguna isPremium.' }, { quoted: message });
      }

      let text = `${head} ${Obrack} *Daftar Pengguna Premium* ${Cbrack}\n${side}\n`;
      isPremiumUsers.forEach((user, index) => {
        const remainingTime = user.time > 0
          ? `${Math.floor(user.time / 3600000)} jam ${Math.floor((user.time % 3600000) / 60000)} menit`
          : 'Expired';
        text += `${side} ${btn} ${user.name} - wa.me/${user.number.replace('@s.whatsapp.net', '')}\n`;
        text += `${side}    ⏳ *Sisa Waktu:* ${remainingTime}\n${side}\n`;
      });

      text += `${side}Total: ${isPremiumUsers.length} pengguna isPremium.\n`;
      text += `${foot}${garis}`;

      conn.sendMessage(chatId, { text }, { quoted: message });
    } catch (error) {
      console.error('Error di plugin listisPrem.js:', error);
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan saat menampilkan daftar pengguna isPremium.`,
      }, { quoted: message });
    }
  },
};