// MY QR STRING: 02.240634,1,MEUCIQCazTCxZ2u7yzR9Q4INnRVDlE67F7OZUN6vH3KUtESw8gIgJ+c0ZRxl1PfHTnr0oOIqxv/GGxKvOUYLhXRQ2SyfHzE=.iitkidcard

function extractRollNumber(qrString) {
  const matches = qrString.match(/\d{6}/g);
  if (!matches) return null;
  const roll = matches.find(num => isRegistered(num));
  return roll || null;
}

function isRegistered(rollNumber) {
  const num = Number(rollNumber);
  return num >= 240001 && num <= 241300;
}

module.exports = { extractRollNumber, isRegistered };
