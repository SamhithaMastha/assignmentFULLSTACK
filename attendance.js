const fs = require('fs');
const PATH = './attendance.json';

let store = {};
try {
  store = JSON.parse(fs.readFileSync(PATH, 'utf8'));
} catch {
  store = {};
}

function markPresent(rollNumber) {
  if (store[rollNumber]) {
    return { success: false, reason: 'already_marked', timestamp: store[rollNumber] };
  }
  store[rollNumber] = new Date().toISOString();
  fs.writeFileSync(PATH, JSON.stringify(store, null, 2));
  return { success: true };
}

function getStats() {
  const rollNumbers = Object.keys(store).sort();
  return { total: rollNumbers.length, rollNumbers };
}

module.exports = { markPresent, getStats };
