const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetches metadata from a YouTube video page
 * @param {string} videoUrl - The YouTube video URL
 * @returns {Promise<Object>} - Returns an object with title, views, description, uploaded date
 */
async function fetchYouTubeMetadata(videoUrl) {
    try {
        const { data } = await axios.get(videoUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(data);

        // Mencari tag <script> yang mengandung 'ytInitialData'
        let ytScript = $("script")
            .filter((i, el) => $(el).html().trim().startsWith("var ytInitialData"))
            .first()
            .html();

        if (!ytScript) throw new Error("Metadata tidak ditemukan!");

        // Menggunakan regex untuk mengekstrak JSON dari script
        let ytDataMatch = ytScript.match(/var ytInitialData\s*=\s*({.+?});/);
        if (!ytDataMatch) throw new Error("Gagal parsing metadata!");

        const jsonData = JSON.parse(ytDataMatch[1]);

        // Ambil metadata dari ytInitialData
        const videoDetails = jsonData.contents.twoColumnWatchNextResults.results.results.contents.find(item => item.videoPrimaryInfoRenderer);
        const videoSecondary = jsonData.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;

        if (!videoDetails) throw new Error("Data video tidak ditemukan!");

        const title = videoDetails.videoPrimaryInfoRenderer.title.runs[0].text;
        const views = videoDetails.videoPrimaryInfoRenderer.viewCount.videoViewCountRenderer.viewCount.simpleText;
        const uploadDate = jsonData.microformat.playerMicroformatRenderer.uploadDate;

        // Mencari deskripsi di bagian secondaryResults
        let description = "Tidak tersedia";
        const descriptionRenderer = videoSecondary.find(item => item.videoSecondaryInfoRenderer);
        if (descriptionRenderer) {
            description = descriptionRenderer.videoSecondaryInfoRenderer.description.runs.map(run => run.text).join("");
        }

        return {
            title,
            views,
            description,
            uploaded: uploadDate
        };
    } catch (error) {
        console.error("Error fetching YouTube metadata:", error.message);
        return null;
    }
}

// Contoh penggunaan
(async () => {
    const metadata = await fetchYouTubeMetadata("https://www.youtube.com/watch?v=Ju-VnQuWoQU");
    console.log(metadata);
})();
