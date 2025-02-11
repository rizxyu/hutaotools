const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { ytmp3, ytmp4 } = require('ruhend-scraper');
const { toAudio } = require("../system/converter/index");

async function downloadBuffer(url) {
    try {
        const response = await axios.get(url, {
            headers: { 
                "Referer": url,
                "Access-Control-Allow-Origin": "*", 
                "Referrer-Policy": "strict-origin-when-cross-origin", 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
            },
            responseType: 'arraybuffer'
        });

        return Buffer.from(response.data);
    } catch (error) {
        throw new Error(`Gagal mendownload buffer: ${error.message}`);
    }
}

async function youtubedl(url) {
    try {
        const videoId = new URL(url).searchParams.get("v");
        const isMusic = url.includes("music.youtube.com");
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        if (isMusic) {
            const musicData = await ytmp3(url);
            const audioBuffer = await downloadBuffer(musicData.audio);
            const convertedBuffer = await toAudio(audioBuffer, "mp3");

            const filePath = path.join(__dirname, '../cdn', `${videoId}.mp3`);
            await fs.promises.writeFile(filePath, convertedBuffer.data);

            return {
                status: 200,
                type: "ytmp3",
                title: musicData.title,
                thumbnail,
                music: [{
                    resolusi: "128kbps",
                    url: `https://beta.wzblueline.xyz/cdn/${videoId}.mp3`
                }]
            };
        }

        const [videoData, musicData] = await Promise.all([
            ytmp4(url),
            ytmp3(url)
        ]);

        const audioBuffer = await downloadBuffer(musicData.audio);
        const convertedBuffer = await toAudio(audioBuffer, "mp3");

        const filePath = path.join(__dirname, '../cdn', `${videoId}.mp3`);
        await fs.promises.writeFile(filePath, convertedBuffer.data);

        return {
            status: 200,
            type: "youtube",
            title: videoData.title,
            thumbnail,
            video: [{ 
                resolusi: "HD",
                url: videoData.video
            }],
            music: [{
                resolusi: "128kbps",
                url: `https://beta.wzblueline.xyz/cdn/${videoId}.mp3`
            }]
        };
    } catch (error) {
        throw new Error(`Error di youtubedl: ${error.message}`);
    }
}

module.exports = youtubedl;