const https = require('https');
const { ytmp3, ytmp4 } = require('ruhend-scraper')



function youtubedl(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const videoId = new URL(url).searchParams.get("v");
            const isMusic = url.includes("music.youtube.com");
            const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            
            if (isMusic) {
                const musicData = await ytmp3(url);

                return resolve({
                    status: 200,
                    type: "ytmp3",
                    title: musicData.title,
                    thumbnail,
                    music: [{
                        resolusi: "128kbps",
                        url: musicData.audio
                    }]
                });
            }
            
            const [videoData, musicData] = await Promise.all([
                await ytmp4(url),
                await ytmp3(url)
            ]);
            
            resolve({
                status: 200,
                type: "youtube",
                title: videoData.title,
                thumbnail,
                video: /*videoData.formats.map(format => ({
                    resolusi: format.resolution,
                    size: format.size,
                    url: format.download
                })),*/ [{ 
                  resolusi: "HD",
                  url:videoData.video,
                }],
                music: [{
                    resolusi: "128kbps",
                    url: musicData.audio
                }]
            });
        } catch (error) {
            reject(error);
        }
    });
}


module.exports = youtubedl;
