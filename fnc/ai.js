const { enhance } = require("../lib/pradigm");

module.exports = async function (req, res) {
    try {
        const { buffer } = req.body;
        const ip = req.ip.replace("::ffff:", "") || req.ip;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Token is missing or invalid" });
    }
    
    const token = authHeader.split(" ")[1];
    const isValid = global.tokenVd.some(entry => entry.ip === ip && entry.token === token);
    if (!isValid) return res.status(403).json({ message: "Forbidden: Invalid token or IP mismatch" });
        if (!buffer) return res.status(400).json({ error: "Buffer diperlukan." });

        const imgBuffer = Buffer.from(buffer);

        const enhancedImage = await enhance(imgBuffer);
        if (!enhancedImage) throw new Error("Gagal memproses gambar.");
        res.setHeader("Content-Type", "image/png");
        res.send(enhancedImage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan saat memproses gambar." });
    }
};