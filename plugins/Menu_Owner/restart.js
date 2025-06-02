const cleartemp = require('./cleartemp');

module.exports = {
  name: 'restart',
  command: ['restart', 'rt'],
  tags: 'Owner Menu',
  desc: 'Merestart bot',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isOwner(module.exports, conn, message))) return;

    await cleartemp.run(conn, message, { chatInfo, textMessage, prefix, commandText, args });

    await conn.sendMessage(chatId, { text: "🔄 Membersihkan folder temp selesai. Bot akan restart dalam 2 detik..." }, { quoted: message });

    await new Promise(resolve => setTimeout(resolve, 2000));

    process.exit(1);
  }
};