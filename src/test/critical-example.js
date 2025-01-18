function processArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) {
      i--; 
    }
  }
}

export { queryDatabase, addEventHandler, processUserData, processArray };
