// This is a critcail issue that should be fixed immediately
function processArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) {
      i--; 
    }
  }
}

export { queryDatabase, addEventHandler, processUserData, processArray };
