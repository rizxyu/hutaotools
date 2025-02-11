const { promises } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Buffer.isBuffer(buffer)) return reject(new Error("Input harus berupa Buffer"));

      let tmp = join(__dirname, '../../tmp', `${Date.now()}.${ext}`);
      let out = tmp + (ext2 ? `.${ext2}` : '');

      await promises.writeFile(tmp, buffer);

      const process = spawn('ffmpeg', ['-y', '-i', tmp, ...args, out]);

      let errorOutput = '';
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      });

      process.on('exit', async (code) => {
        await promises.unlink(tmp);
        if (code !== 0) {
          return reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
        }

        try {
          const data = await promises.readFile(out);
          resolve({
            data,
            filename: out,
            delete: () => promises.unlink(out)
          });
        } catch (e) {
          reject(new Error(`Gagal membaca output: ${e.message}`));
        }
      });

    } catch (e) {
      reject(new Error(`Error dalam ffmpeg function: ${e.message}`));
    }
  });
}

function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

module.exports = { toAudio };