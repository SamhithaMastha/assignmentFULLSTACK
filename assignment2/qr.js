const Jimp = require('jimp');
const jsQR = require('jsqr');

async function decodeQR(imagePath) {
  const image = await Jimp.read(imagePath);
  const { data, width, height } = image.bitmap;
  const result = jsQR(data, width, height);
  if (!result) {
    throw new Error('No QR code found');
  }
  return result.data;
}

if (require.main === module) {
  decodeQR('./test.png')
    .then(data => console.log('QR Data:', data))
    .catch(err => console.error('Error:', err.message));
}

module.exports = { decodeQR };
