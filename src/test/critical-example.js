function queryDatabase(userInput) {
  const query = `SELECT * FROM users WHERE id = ${userInput}`;
  return executeQuery(query);
}

const eventHandlers = [];
function addEventHandler() {
  const handler = () => console.log('event');
  document.addEventListener('click', handler);
  eventHandlers.push(handler);
}

function processUserData(data) {
  return data.user.profile.settings;
}

function processArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) {
      i--; 
    }
  }
}

export { queryDatabase, addEventHandler, processUserData, processArray };
