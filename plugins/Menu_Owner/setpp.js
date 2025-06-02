const https = require("https");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const { FormData, Blob } = require("formdata-node");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp"); // Install: npm install sharp

module.exports = {
  name: 'setpp',
  command: ['setpp', 'setprofile'],
  tags: 'Owner Menu',
  desc: 'Mengubah foto profil bot tanpa crop.',
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
        text: `📷 *Cara menggunakan perintah:*\n\nKirim gambar dengan caption atau reply gambar dengan perintah:\n\`${prefix}${commandText}\`\n\n💡 *Tips:* Gambar akan otomatis disesuaikan menjadi persegi tanpa crop!`
      }, { quoted: message });
    }

    // Send processing message
    const processingMsg = await conn.sendMessage(chatId, {
      text: "⏳ Sedang memproses gambar..."
    }, { quoted: message });

    try {
      const stream = await downloadContentFromMessage(mediaMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Process image to make it square without cropping
      const processedBuffer = await makeSquareImage(buffer);

      // Convert to PNG via EZGIF
      const url = await webp2png(processedBuffer);

      // Update profile picture
      await conn.updateProfilePicture(conn.user.id, { url });

      // Delete processing message and send success message
      await conn.sendMessage(chatId, { delete: processingMsg.key });
      
      conn.sendMessage(chatId, {
        text: "✅ Foto profil bot berhasil diperbarui!\n\n📐 Gambar telah disesuaikan menjadi persegi tanpa memotong bagian penting."
      }, { quoted: message });

    } catch (error) {
      console.error("❌ Error saat setpp:", error);
      
      // Delete processing message
      await conn.sendMessage(chatId, { delete: processingMsg.key });
      
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan saat memperbarui foto profil bot.\n\n*Error:* ${error.message || 'Unknown error'}`
      }, { quoted: message });
    }
  }
};

// Function to make image square without cropping
async function makeSquareImage(buffer) {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    const { width, height } = metadata;
    const size = Math.max(width, height);
    
    // Create square canvas with white background
    const squareImage = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([{
      input: await image.resize({
        width: width > height ? size : Math.round(width * size / height),
        height: height > width ? size : Math.round(height * size / width),
        fit: 'inside'
      }).toBuffer(),
      gravity: 'center'
    }])
    .jpeg({ quality: 90 })
    .toBuffer();
    
    return squareImage;
  } catch (error) {
    console.log("⚠️ Sharp processing failed, using original buffer:", error.message);
    return buffer;
  }
}

// Enhanced WebP to PNG conversion via EZGIF
async function webp2png(source) {
  const agent = new https.Agent({ 
    rejectUnauthorized: false,
    timeout: 30000 // 30 second timeout
  });

  try {
    // Convert Buffer to ArrayBuffer
    let arrayBuffer;
    if (Buffer.isBuffer(source)) {
      arrayBuffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    } else {
      throw new Error("Input source must be a Buffer");
    }

    // Step 1: Upload image
    const form = new FormData();
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    form.append('new-image-url', '');
    form.append('new-image', blob, 'image.jpg');

    const res = await fetch('https://s6.ezgif.com/jpg-to-png', {
      method: 'POST',
      body: form,
      agent,
      timeout: 30000
    });

    if (!res.ok) {
      throw new Error(`EZGIF upload failed: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const { document } = new JSDOM(html).window;

    const fileInput = document.querySelector('form input[name="file"]');
    if (!fileInput) {
      throw new Error('❌ Tahap 1 gagal: Tidak menemukan input file di form EZGIF.');
    }

    const fileValue = fileInput.value;

    // Step 2: Convert image
    const form2 = new FormData();
    for (let input of document.querySelectorAll('form input[name]')) {
      if (input.name && input.value) {
        form2.append(input.name, input.value);
      }
    }

    const res2 = await fetch(`https://ezgif.com/jpg-to-png/${fileValue}`, {
      method: 'POST',
      body: form2,
      agent,
      timeout: 30000
    });

    if (!res2.ok) {
      throw new Error(`EZGIF conversion failed: ${res2.status} ${res2.statusText}`);
    }

    const html2 = await res2.text();
    const { document: document2 } = new JSDOM(html2).window;

    const img = document2.querySelector('div#output > p.outfile > img') || 
               document2.querySelector('img[src*=".png"]');
    
    if (!img?.src) {
      throw new Error('❌ Gagal mendapatkan gambar hasil konversi!');
    }

    return new URL(img.src, res2.url).toString();
    
  } catch (error) {
    console.error("EZGIF conversion error:", error);
    throw new Error(`Konversi gambar gagal: ${error.message}`);
  }
}