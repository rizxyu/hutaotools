const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');
const fromBuffer = x => import("file-type").then(v => v.fileTypeFromBuffer(x))
const https = require('https');
const fs = require('fs');

async function getLdJson(url) {
    try {
        const x = await axios.get(url);
        const $ = cheerio.load(x.data);
        const ldJsonScript = $('script[type="application/ld+json"]').html();
        const ldJson = JSON.parse(ldJsonScript);
        const imageUrl = $('div[data-testid="entity-image"] img').attr('src');
        const ac = $('div[data-testid="entity-avatar-image"] img').attr('src');
        const artist_name = $('div[data-encore-id="text"] a').text();
        
        const res = {
          status: x.status,
          type: "spotify",
          message: x.statusText,
          artist: {
            name: artist_name ||null,
            cover: ac || null
          },
          title: ldJson.name,
          description: ldJson.description,
          publish: ldJson.datePublished,
          thumbnail: imageUrl,
          music: [{
            resolusi: "default",
            url: `https://yank.g3v.co.uk/track/${getSpotifyTrackId(url)}`
          }]
        }
        
        console.log(res);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Contoh penggunaan
getLdJson('https://open.spotify.com/track/0FJQ4TrvvMLiCO7z8Rfl30?si=J_BRENtPSgmQJ6_tV4OmBA');



function getSpotifyTrackId(url) {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname !== 'open.spotify.com') {
            throw new Error('URL bukan dari Spotify');
        }
        const pathSegments = parsedUrl.pathname.split('/');
        if (pathSegments[1] !== 'track') {
            throw new Error('URL bukan untuk track Spotify');
        }
        const trackId = pathSegments[2];

        return trackId;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

// Contoh penggunaan
const url = "https://open.spotify.com/track/0FJQ4TrvvMLiCO7z8Rfl30?si=J_BRENtPSgmQJ6_tV4OmBA";
const trackId = getSpotifyTrackId(url);
console.log(trackId);  // Output: 0FJQ4TrvvMLiCO7z8Rfl30