// Mock nanoid for Jest tests
let counter = 0;

const nanoid = () => {
  counter++;
  return `MOCK${counter.toString().padStart(7, '0')}`;
};

const customAlphabet = (alphabet, size) => {
  return () => {
    counter++;
    return `TEST${counter.toString().padStart(7, '0')}`;
  };
};

module.exports = {
  nanoid,
  customAlphabet,
};