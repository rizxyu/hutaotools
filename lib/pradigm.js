const FormData = require("form-data");
const axios = require("axios");
const fs = require('fs');
const qs = require('qs');

const tool = [ 'removebg', 'enhance', 'upscale', 'restore', 'colorize' ];

const pxpic = {
 upload: async (filePath) => {
   const {
    fileTypeFromBuffer: fromBuffer
} = await import( 'file-type')
  const buffer = fs.readFileSync(filePath);
  const { ext, mime } = (await fromBuffer(buffer)) || {};
  const fileName = Date.now() + "." + ext;

  const folder = "uploads";
  const responsej = await axios.post("https://pxpic.com/getSignedUrl", { folder, fileName }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const { presignedUrl } = responsej.data;

  await axios.put(presignedUrl, buffer, {
    headers: {
      "Content-Type": mime,
    },
  });

  const cdnDomain = "https://files.fotoenhancer.com/uploads/";
  const sourceFileUrl = cdnDomain + fileName;

  return sourceFileUrl;
  },
  create: async (filePath, tools) => {
    if (!tool.includes(tools)) { 
        return `Pilih salah satu dari tools ini: ${tool.join(', ')}`; 
    }
    const url = await pxpic.upload(filePath);
    let data = qs.stringify({
      'imageUrl': url,
      'targetFormat': 'png',
      'needCompress': 'no',
      'imageQuality': '100',
      'compressLevel': '6',
      'fileOriginalExtension': 'png',
      'aiFunction': tools,
      'upscalingLevel': ''
    });

    let config = {
      method: 'POST',
      url: 'https://pxpic.com/callAiFunction',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept-language': 'id-ID'
      },
      data: data
    };

    const api = await axios.request(config);
    return api.data;
  }
}


const domain = {
  efek: "https://effect-api.visual-paradigm.com",
  ai: "https://ai-services.visual-paradigm.com"
}


const paradigm = {
    async rmbg(buffer) {
      
      const { fileTypeFromBuffer } = await import('file-type');
        const fileType = await fileTypeFromBuffer(buffer);

        if (!fileType || !['image/jpeg', 'image/png', 'image/gif'].includes(fileType.mime)) throw new Error("File yang diunggah bukan gambar. Hanya file gambar yang diperbolehkan.");

        const form = new FormData();
        form.append("file", buffer, `anjuc.jpg`);

        const { data } = await axios.post(`${domain.efek}/remove-bg`, form, {
            headers: form.getHeaders(),
            responseType: "arraybuffer"
        }).catch(e => e.response);

        return data;
    },
    async enhance(buffer) {
      const { fileTypeFromBuffer } = await import('file-type');
      
      const fileType = await fileTypeFromBuffer(buffer);

        if (!fileType || !['image/jpeg', 'image/png', 'image/gif'].includes(fileType.mime)) throw new Error("File yang diunggah bukan gambar. Hanya file gambar yang diperbolehkan.");

        const form = new FormData();
        form.append("file", buffer, `${Date.now()}.jpg`);

        const { data } = await axios.post(`${domain.ai}/api/super-resolution/file`, form, {
            headers: form.getHeaders(),
            responseType: "arraybuffer"
        }).catch(e => e.response);

        return data;
    }
};

module.exports = { enhance: paradigm.enhance, pxpic };