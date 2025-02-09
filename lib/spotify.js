const http = require('https');
const axios = require("axios");
const fs = require("fs"); // Import modul fs yang sebelumnya belum diimport

async function request(url) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'spotify-downloader9.p.rapidapi.com',
      // Jika port tidak diperlukan, opsi ini bisa dihilangkan atau diset ke 443 untuk HTTPS
      // port: 443,
      path: `/downloadSong?songId=${encodeURIComponent(url)}`,
      headers: {
        'x-rapidapi-key': process.env.rapid_api_token,
        'x-rapidapi-host': 'spotify-downloader9.p.rapidapi.com'
      }
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          if (!body.success) return reject(new Error('Invalid API response'));
          resolve(body);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function spotify(url) {
  try {
    const nn = await request(url);
    const x =nn.data

    return {
      status: 200,
      type: "spotify",
      title: x.title,
      artist: x.artist,
      thumbnail: x.cover,
      music: [{
        resolusi: "128kb",
        url: x.downloadLink
      }]
    };
  } catch (error) {
    throw error;
  }
}

module.exports = spotify;
