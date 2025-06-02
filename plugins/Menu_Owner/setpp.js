const https = require("https");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const { FormData, Blob } = require("formdata-node");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: 'setpp',
  command: ['setpp', 'setprofile'],
  tags: 'Owner Menu',
  desc: 'Mengubah foto profil bot.',
  prefix: true,
  owner: true,

  run: async (conn, message, { chatInfo, prefix, commandText }) => {
    const { chatId } = chatInfo;
    const mtype = Object.keys(message.message || {})[0];

    let mediaMessage;
    if (mtype === "imageMessage") {
      mediaMessage = message.message.imageMessage;
    } else if (
      mtype === "extendedTextMessage" &&
      message.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage
    ) {
      mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    if (!mediaMessage) {
      return conn.sendMessage(chatId, {
        text: `📷 *Cara menggunakan perintah:*\n\nKirim gambar dengan caption atau reply gambar dengan perintah:\n\`${prefix}${commandText}\``
      }, { quoted: message });
    }

    try {
      const stream = await downloadContentFromMessage(mediaMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Convert buffer ke PNG url via EZGIF
      const url = await webp2png(buffer);

      await conn.updateProfilePicture(conn.user.id, { url });

      conn.sendMessage(chatId, {
        text: "✅ Foto profil bot berhasil diperbarui!"
      }, { quoted: message });

    } catch (error) {
      console.error("❌ Error saat setpp:", error);
      conn.sendMessage(chatId, {
        text: "❌ Terjadi kesalahan saat memperbarui foto profil bot."
      }, { quoted: message });
    }
  }
};

// Fungsi konversi WebP ke PNG via EZGIF, sudah perbaikan dari buffer ke ArrayBuffer
async function webp2png(source) {
  const agent = new https.Agent({ rejectUnauthorized: false });

  // Convert Buffer ke ArrayBuffer
  let arrayBuffer;
  if (Buffer.isBuffer(source)) {
    arrayBuffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  } else {
    throw new Error("Input source must be a Buffer");
  }

  const form = new FormData();
  const blob = new Blob([arrayBuffer], { type: 'image/webp' });

  // Isi new-image-url dengan kosong, karena kita upload file bukan URL
  form.append('new-image-url', '');
  form.append('new-image', blob, 'image.webp');

  const res = await fetch('https://s6.ezgif.com/webp-to-png', {
    method: 'POST',
    body: form,
    agent
  });

  const html = await res.text();
  const { document } = new JSDOM(html).window;

  const fileInput = document.querySelector('form input[name="file"]');
  if (!fileInput) throw '❌ Tahap 1 gagal: Tidak menemukan input file di form EZGIF.';

  const fileValue = fileInput.value;

  const form2 = new FormData();
  for (let input of document.querySelectorAll('form input[name]')) {
    form2.append(input.name, input.value);
  }

  const res2 = await fetch(`https://ezgif.com/webp-to-png/${fileValue}`, {
    method: 'POST',
    body: form2,
    agent
  });

  const html2 = await res2.text();
  const { document: document2 } = new JSDOM(html2).window;

  const img = document2.querySelector('div#output > p.outfile > img');
  if (!img?.src) throw '❌ Gagal mendapatkan gambar hasil konversi!';

  return new URL(img.src, res2.url).toString();
}

