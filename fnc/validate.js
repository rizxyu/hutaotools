const crypto = require("crypto");

function generateToken() {
  return crypto.randomBytes(35).toString("hex");
}

module.exports = async function(req, res) {
  const ip = req?.ip?.replace("::ffff:", "") || req?.ip;

    const token = generateToken()

  global.tokenVd = global.tokenVd.filter(entry => entry.ip !== ip);
    global.tokenVd.push({ ip, token });
    res.setHeader("X-Auth-Token", token );
    res.status(200).json({
      status: "success",
      message: "Your Ip device Has been stored",
      org: "JELLYBEAN",
      timestamp: Date.now(),
      device: {
        ip,
        "User-Agent": req.get("user-agent"),
      },
    })
}