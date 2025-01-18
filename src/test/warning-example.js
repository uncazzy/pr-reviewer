const unusedVariable = 'never used';

function processData(data) {
  return data.map(item => {
    console.log(item);
    return item.value;
  });
}

let counter = 0;

function getValue(input) {
  if (input > 0) {
    return input;
  }
  return "negative";
}

export { processData, getValue };
