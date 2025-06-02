module.exports = {
  name: 'kick',
  command: ['kick', 'dor', 'tendang', 'keluar'],
  tags: 'Group Menu',
  desc: 'Mengeluarkan anggota dari grup.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    let targetId = target(message, senderId);
    const mentionTarget = targetId;

    const teks = `❌ Gunakan format:\n${prefix}${commandText} @${mentionTarget} atau reply pesan target.`;
    const teks1 = `✅ Berhasil mengeluarkan @${mentionTarget}`;

    if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: message });

    const { botAdmin, userAdmin, adminList } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    }

    if (!botAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });
    }

    let mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let targetUser = mentionedJid[0] || (quotedMessage ? message.message.extendedTextMessage.contextInfo.participant : null);

    if (!targetUser) return conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: message });

    if (adminList.includes(targetUser)) {
      return conn.sendMessage(chatId, { text: "❌ Tidak bisa mengeluarkan admin grup!" }, { quoted: message });
    }

    await conn.groupParticipantsUpdate(chatId, [targetUser], "remove")
      .then(() => conn.sendMessage(chatId, {
        text: teks1,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message }))
      .catch(() => conn.sendMessage(chatId, { text: "❌ Gagal mengeluarkan anggota. Pastikan bot adalah admin!" }, { quoted: message }));
  }
};