const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');
const fromBuffer = x => import("file-type").then(v => v.fileTypeFromBuffer(x))
const https = require('https');
const http = require('http');

async function igdl(url) {
  try {
    const formData = new FormData();
    formData.append('url', url);

    const { data } = await axios.post('https://snapsave.app/id/action.php?lang=id', formData, {
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const js = await new Promise(r => eval(data.replace('eval', 'r')));
    const raw = js.match(/document\.getElementById\("download-section"\)\.innerHTML\s*=\s*"(.*?)";/s);
    const $ = cheerio.load(raw[1].replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '').replace(/\\\\/g, '\\'));
    let res = {
      status: 200,
      type: "ig",
      title: "",
      thumbnail: null,
      video: [],
      images: []
    };
     
     
     let sesi = []
    // Cek setiap link yang ada
    $('.download-items__btn a').each(async (i, element) => {
      const xk = $(element).attr('href');
      sesi.push(xk)
    });
    for (const i of sesi) {
         const response = await axios.get(i, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data);
          const type = await fromBuffer(buffer);
          
          if (type) {
            if (type.mime.startsWith('image')) {
              res.images.push(i);
              if (!res.thumbnail) {
                res.thumbnail = i;
              }
            }
            // Jika file adalah video
            else if (type.mime.startsWith('video')) {
              res.video.push({ resolusi: "HD", url: i, mimetype: type.mime });
            }
          }
    }
   console.log(res)
    return res;
  } catch (err) {
    console.error('RUSAK CEUNAHHHH,,,,,Error:', err.message);
    return null;
  }
}

module.exports = igdl;