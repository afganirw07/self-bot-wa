module.exports = {
  name: 'Eval',
  command: ['>', '=>', '~>'],
  tags: 'Owner Menu',
  desc: 'Mengeksekusi kode JavaScript secara langsung',
  prefix: false,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, message))) return;

    const code = args.join(' ').trim();
    if (!code) {
      return conn.sendMessage(chatId, { text: '⚠️ Harap masukkan kode JavaScript yang ingin dijalankan!' }, { quoted: message });
    }

    try {
      let result;
      if (commandText === '~>') {
        let outputLogs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          outputLogs.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' '));
        };

        result = await eval(`(async () => { ${code}; })()`);
        console.log = originalLog;

        const logText = outputLogs.join('\n');
        const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        const output = [logText, resultText].filter(Boolean).join('\n') || '✅ *Kode dijalankan tanpa output.*';

        await conn.sendMessage(chatId, { text: `✅ *Output:*\n\`\`\`${output}\`\`\`` }, { quoted: message });

      } else if (commandText === '=>') {
        result = await eval(`(async () => { return (${code}); })()`);
      } else {
        result = await eval(`(async () => { ${code}; })()`);
      }

      if (commandText !== '~>') {
        const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        const response = output && output !== 'undefined'
          ? `✅ *Output:*\n\`\`\`${output}\`\`\``
          : '✅ *Kode berhasil dijalankan tanpa output.*';
        await conn.sendMessage(chatId, { text: response }, { quoted: message });
      }

    } catch (err) {
      conn.sendMessage(chatId, { text: `❌ *Error:* ${err.message}` }, { quoted: message });
    }
  }
};