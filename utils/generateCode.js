const { customAlphabet } = require('nanoid');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const nanoid6 = customAlphabet(alphabet, 6);
const nanoid7 = customAlphabet(alphabet, 7);
const nanoid8 = customAlphabet(alphabet, 8);

function generateCode() {
  const lengths = [6, 7, 8];
  const pick = lengths[Math.floor(Math.random() * lengths.length)];

  if (pick === 6) return nanoid6();
  if (pick === 7) return nanoid7();
  return nanoid8();
}

module.exports = generateCode;
