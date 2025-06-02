module.exports = {
  name: 'listgroup',
  command: ['listgc', 'listgroup'],
  tags: 'Info Menu',
  desc: 'Melihat semua grup yang bot masuki',
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

    try {
      const groups = await conn.groupFetchAllParticipating();
      const groupList = Object.values(groups);

      if (groupList.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Bot tidak tergabung dalam grup mana pun.' }, { quoted: message });
      }

      let response = `📋 *Daftar Grup yang Bot Ikuti:*\n\n`;
      groupList.forEach((group, index) => {
        response += `${index + 1}. *${group.subject}*\n   📌 ID: ${group.id}\n   👥 Member: ${group.size}\n\n`;
      });

      conn.sendMessage(chatId, { text: response }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengambil daftar grup. Coba lagi nanti.' }, { quoted: message });
    }
  }
};