const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");

async function spotify(url) {
    try {
      const { ID3Writer } = await import("browser-id3-writer");
        const x = await axios.get(url);
        const $ = cheerio.load(x.data);
        const ldJsonScript = $('script[type="application/ld+json"]').html();
        const ldJson = JSON.parse(ldJsonScript);
        const imageUrl = $('div[data-testid="entity-image"] img').attr('src');
        const ac = $('div[data-testid="entity-avatar-image"] img').attr('src');
        const artist_name = $('div[data-encore-id="text"] a').text();
        
        const { data: audiopile } = await axios.get(`https://yank.g3v.co.uk/track/${getSpotifyTrackId(url)}`, {
        responseType: "arraybuffer"
      });
      const audioBuffer = Buffer.from(audiopile);
      const writer = new ID3Writer(audioBuffer);
      writer
        .setFrame("TIT2", ldJson.name) 
        .setFrame("TPE1", [artist_name])
        .setFrame("APIC", {
          type: 3,
          data: (
            await axios.get(imageUrl, { responseType: "arraybuffer" })
          ).data, 
          description: "Cover"
        });
      writer.addTag();
      const filename = `/temp/${ldJson.name}.mp3`
      const taggedAudio = await fs.writeFileSync(`.${filename}`, Buffer.from(writer.arrayBuffer));
      
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
            url: `https://beta.wzblueline.xyz${filename}`
          }]
        }
        
        console.log(res);
        return res
    } catch (error) {
      return { status: 401, message: error }
        console.error('Error:', error.message);
    }
}

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

module.exports = spotify