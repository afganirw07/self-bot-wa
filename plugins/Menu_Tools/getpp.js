module.exports = {
  name: 'getpp',
  command: ['getpp'],
  tags: 'Tools Menu',
  desc: 'Mengambil foto profil pengguna',
  prefix: true,
  owner: false,
  isPremium: true,

  run: async (conn, message, {
    chatInfo,
    commandText,
    textMessage,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isPrem(module.exports, conn, message))) return;
    const defaultPP = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';

    if (!isGroup) {
      return conn.sendMessage(chatId, {
        text: "❌ Perintah ini hanya bisa digunakan dalam grup!"
      }, { quoted: message });
    }

    let targetId = target(message, senderId);
    if (args[1] && !message.message?.extendedTextMessage) {
      targetId = args[1].replace(/[^0-9]/g, '') || targetId;
    }
    const jid = targetId + '@s.whatsapp.net';
    const mentionTarget = targetId;

    let ppuser;
    try {
      ppuser = await conn.profilePictureUrl(jid, 'image');
    } catch {
      ppuser = defaultPP;
    }

    await conn.sendMessage(chatId, {
      image: { url: ppuser },
      caption: `Foto profil @${mentionTarget}`,
      mentions: [jid]
    }, { quoted: message });
  }
};