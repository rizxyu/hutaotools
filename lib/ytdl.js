const https = require('https');

function requestAPI(hostname, path) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname,
            port: null,
            path: path,
            headers: {
                'x-rapidapi-key': process.env.rapid_api_token,
                'x-rapidapi-host': hostname
            }
        };

        const req = https.request(options, (res) => {
            let chunks = [];

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

function youtubedl(url, apiKey) {
    return new Promise(async (resolve, reject) => {
        try {
            const videoId = new URL(url).searchParams.get("v");
            const isMusic = url.includes("music.youtube.com");
            const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            
            if (isMusic) {
                const musicData = await requestAPI(
                    'yt-search-and-download-mp3.p.rapidapi.com',
                    `/mp3?url=${encodeURIComponent(url)}`
                );

                return resolve({
                    status: 200,
                    type: "ytmp3",
                    title: musicData.title,
                    thumbnail,
                    music: [{
                        resolusi: "128kbps",
                        url: musicData.download
                    }]
                });
            }
            
            const [videoData, musicData] = await Promise.all([
                requestAPI('youtube-mp4-downloader.p.rapidapi.com', `/mp4?url=${encodeURIComponent(url)}`),
                requestAPI('yt-search-and-download-mp3.p.rapidapi.com', `/mp3?url=${encodeURIComponent(url)}`)
            ]);
            
            resolve({
                status: 200,
                type: "ytmp4+ytmp3",
                title: videoData.title,
                thumbnail,
                video: videoData.formats.map(format => ({
                    resolusi: format.resolution,
                    size: format.size,
                    url: format.download
                })),
                music: [{
                    resolusi: "128kbps",
                    url: musicData.download
                }]
            });
        } catch (error) {
            reject(error);
        }
    });
}


module.exports = youtubedl;
