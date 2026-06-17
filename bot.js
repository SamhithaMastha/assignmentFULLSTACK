require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { decodeQR } = require('./qr');
const { extractRollNumber, isRegistered } = require('./parser');
const { markPresent, getStats } = require('./attendance');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome! Send a photo of a student IITK ID card to mark attendance. Use /report to see stats.');
});

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  try {
    const photo = msg.photo[msg.photo.length - 1];
    const fileInfo = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;

    const tmpPath = path.join(require('os').tmpdir(), `qr_${Date.now()}.jpg`);
    await downloadFile(fileUrl, tmpPath);

    const qrData = await decodeQR(tmpPath);
    fs.unlinkSync(tmpPath);

    const rollNumber = extractRollNumber(qrData);
    if (!rollNumber) {
      return bot.sendMessage(chatId, 'No valid roll number found in QR code.');
    }

    if (!isRegistered(rollNumber)) {
      return bot.sendMessage(chatId, `Roll number ${rollNumber} is out of registered range (240001-241300).`);
    }

    const result = markPresent(rollNumber);
    if (!result.success) {
      return bot.sendMessage(chatId, `Roll ${rollNumber} already marked present at ${result.timestamp}.`);
    }

    bot.sendMessage(chatId, `Attendance marked for roll number ${rollNumber}.`);
  } catch (err) {
    if (err.message === 'No QR code found') {
      bot.sendMessage(chatId, 'No QR code detected in the image.');
    } else {
      bot.sendMessage(chatId, `Error: ${err.message}`);
    }
  }
});

bot.onText(/\/report/, (msg) => {
  const { total, rollNumbers } = getStats();
  const list = rollNumbers.length ? rollNumbers.join(', ') : 'None yet';
  bot.sendMessage(msg.chat.id, `Attendance Report\nTotal: ${total}\nRoll Numbers: ${list}`);
});

bot.onText(/\/export/, (msg) => {
  const data = JSON.parse(fs.readFileSync('./attendance.json', 'utf8'));
  const csv = 'RollNumber,Timestamp\n' +
    Object.entries(data).map(([roll, ts]) => `${roll},${ts}`).join('\n');
  const tmpPath = path.join(require('os').tmpdir(), 'attendance_export.csv');
  fs.writeFileSync(tmpPath, csv);
  bot.sendDocument(msg.chat.id, tmpPath, {}, { filename: 'attendance.csv' });
});

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

console.log('Bot is running...');
