module.exports = {
  name: 'demote',
  command: ['demote', 'stopadmin', 'demoteadmin'],
  tags: 'Group Menu',
  desc: 'Turunkan admin grup menjadi anggota',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);
    if (!userAdmin) return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    if (!botAdmin) return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });

    const targetId = target(message, senderId);
    if (!targetId || targetId === senderId.replace(/@s\.whatsapp\.net$/, '')) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Harap mention atau reply admin yang ingin diturunkan!\nContoh: ${prefix}demote @user`,
        mentions: []
      }, { quoted: message });
    }

    const metadata = await mtData(chatId, conn);
    if (!metadata) {
      return conn.sendMessage(chatId, { text: '❌ Gagal mengambil metadata grup.' }, { quoted: message });
    }

    const fullTargetId = `${targetId.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

    const isTargetAdmin = metadata.participants.some(p =>
      p.id === fullTargetId && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!isTargetAdmin) {
      return conn.sendMessage(chatId, {
        text: `❌ @${targetId} bukan admin grup!`,
        mentions: [fullTargetId]
      }, { quoted: message });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [fullTargetId], 'demote');

      if (!global.groupCache) global.groupCache = new Map();

      global.groupCache.delete(chatId);
      await mtData(chatId, conn);

      conn.sendMessage(chatId, {
        text: `✅ Berhasil menurunkan @${targetId} dari admin grup!`,
        mentions: [fullTargetId]
      }, { quoted: message });
    } catch (err) {
      console.error('Error saat demote:', err);
      conn.sendMessage(chatId, {
        text: '❌ Gagal menurunkan admin. Pastikan bot adalah admin dan ID yang dimaksud valid.'
      }, { quoted: message });
    }
  }
};