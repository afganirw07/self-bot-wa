module.exports = {
  name: 'clearchat',
  command: ['clearchat', 'cc'],
  tags: 'Tools Menu',
  desc: 'Bersihkan semua riwayat chat',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    try {
      console.log(`Attempting to clear chat for chatId: ${chatId}`);

      await conn.chatModify({ clear: { jid: chatId, fromMe: true } }, chatId);

      console.log(`Successfully cleared chat for chatId: ${chatId}`);
      conn.sendMessage(chatId, { text: `✅ Semua riwayat chat berhasil dibersihkan!` }, { quoted: message });

    } catch (err) {
      console.error('Error during clear chat operation:', err);
      conn.sendMessage(chatId, { text: '❌ Gagal membersihkan riwayat chat. Pastikan bot memiliki izin yang diperlukan.' }, { quoted: message });
    }
  }
};