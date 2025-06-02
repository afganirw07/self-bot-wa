module.exports = {
  name: 'promote',
  command: ['promote', 'jadiadmin', 'promoteadmin'],
  tags: 'Group Menu',
  desc: 'Promosikan anggota menjadi admin grup',
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
        text: `⚠️ Harap mention atau reply anggota yang ingin dipromosikan!\nContoh: ${prefix}${commandText} @user`,
        mentions: []
      }, { quoted: message });
    }

    const metadata = await mtData(chatId, conn);
    if (!metadata) {
      return conn.sendMessage(chatId, { text: '❌ Gagal mengambil metadata grup.' }, { quoted: message });
    }

    const fullTargetId = `${targetId.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

    const isAlreadyAdmin = metadata.participants.some(p =>
      p.id === fullTargetId && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (isAlreadyAdmin) {
      return conn.sendMessage(chatId, {
        text: `⚠️ @${targetId} sudah menjadi admin grup!`,
        mentions: [fullTargetId]
      }, { quoted: message });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [fullTargetId], 'promote');

      if (!global.groupCache) global.groupCache = new Map();
      global.groupCache.delete(chatId);
      await mtData(chatId, conn);

      conn.sendMessage(chatId, {
        text: `✅ Berhasil mempromosikan @${targetId} menjadi admin grup!`,
        mentions: [fullTargetId]
      }, { quoted: message });
    } catch (err) {
      console.error('Error saat promote:', err);
      conn.sendMessage(chatId, {
        text: '❌ Gagal mempromosikan anggota. Pastikan bot adalah admin dan ID yang dimaksud valid.'
      }, { quoted: message });
    }
  }
};