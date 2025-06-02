function sanitizeGroupName(name) {
  return name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
}

module.exports = {
  name: 'warn',
  command: ['warn', 'warning'],
  tags: 'Group Menu',
  desc: 'Memberi sangsi kepada member',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    const data = readDB();

    if (!data.Grup) data.Grup = {};
    if (!data.Private) data.Private = {};
    if (!data.Warning) data.Warning = {};

    if (!isGroup) return conn.sendMessage(chatId, { text: 'Fitur ini hanya untuk grup!' }, { quoted: message });

    const { botAdmin, userAdmin, subject } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    if (!botAdmin) return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });

    const rawGroupName = subject || `grup${Object.keys(data.Grup).length + 1}`;
    const groupName = sanitizeGroupName(rawGroupName);
    const grupData = gcData(chatId);

    if (!args[0]) {
      const contoh = `Contoh penggunaan:
.warn 1 @tag/reply
.warn set <angka>
.warn reset @tag/reply`;
      return conn.sendMessage(chatId, { text: contoh }, { quoted: message });
    }

    if (args[0] === 'set') {
      const jumlah = parseInt(args[1]);
      if (isNaN(jumlah)) {
        return conn.sendMessage(chatId, { text: 'Masukkan angka maksimum peringatan.' }, { quoted: message });
      }

      if (!grupData) {
        return conn.sendMessage(chatId, {
          text: `Grup belum terdaftar di dalam database.\n\nKetik *.daftargc* untuk mendaftarkan grup ini.`,
        }, { quoted: message });
      }

      grupData.setWarn = jumlah;
      saveDB(data);
      return conn.sendMessage(chatId, {
        text: `Set maksimum warning menjadi ${jumlah} untuk grup *${rawGroupName}*.`,
      }, { quoted: message });
    }

    if (args[0] === 'reset') {
      const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || message.message?.extendedTextMessage?.contextInfo?.participant;

      if (!target) return conn.sendMessage(chatId, { text: 'Tag atau reply pengguna untuk mereset warning.' }, { quoted: message });

      const privateKey = Object.keys(data.Private || {}).find(k => data.Private[k].Nomor === target);
      if (privateKey) {
        data.Private[privateKey].warn = 0;
        saveDB(data);
        return conn.sendMessage(chatId, { text: `Warning untuk @${target.split('@')[0]} telah direset.`, mentions: [target] }, { quoted: message });
      }

      if (data.Warning[target]) {
        data.Warning[target].warn = 0;
        saveDB(data);
        return conn.sendMessage(chatId, { text: `Warning untuk @${target.split('@')[0]} telah direset.`, mentions: [target] }, { quoted: message });
      }

      return conn.sendMessage(chatId, { text: `@${target.split('@')[0]} tidak memiliki data warning.`, mentions: [target] }, { quoted: message });
    }

    if (args[0] === '1') {
      let target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || message.message?.extendedTextMessage?.contextInfo?.participant;

      if (!target) {
        return conn.sendMessage(chatId, { text: 'Tag atau reply pengguna yang ingin diberi peringatan.' }, { quoted: message });
      }

      target = target.split(':')[0];
      const privateKey = Object.keys(data.Private || {}).find(k => data.Private[k].Nomor === target);
      const groupSetWarn = grupData?.setWarn || 3;

      if (privateKey) {
        const current = data.Private[privateKey].warn || 0;
        data.Private[privateKey].warn = current + 1;

        if (data.Private[privateKey].warn >= groupSetWarn) {
          await conn.groupParticipantsUpdate(chatId, [target], 'remove');
          conn.sendMessage(chatId, { text: `@${target.split('@')[0]} dikeluarkan karena melampaui batas peringatan.`, mentions: [target] }, { quoted: message });
        } else {
          conn.sendMessage(chatId, { text: `@${target.split('@')[0]} diberi peringatan (${data.Private[privateKey].warn}/${groupSetWarn})`, mentions: [target] }, { quoted: message });
        }
      } else {
        if (!data.Warning[target]) {
          data.Warning[target] = { idNomor: target, warn: 1 };
        } else {
          data.Warning[target].warn += 1;
        }

        if (data.Warning[target].warn >= groupSetWarn) {
          await conn.groupParticipantsUpdate(chatId, [target], 'remove');
          conn.sendMessage(chatId, { text: `@${target.split('@')[0]} dikeluarkan karena melampaui batas peringatan.`, mentions: [target] }, { quoted: message });
        } else {
          conn.sendMessage(chatId, { text: `@${target.split('@')[0]} diberi peringatan (${data.Warning[target].warn}/${groupSetWarn})`, mentions: [target] }, { quoted: message });
        }
      }

      saveDB(data);
    }
  }
};