import { writeFile, readFile } from 'fs';

/**
 * Add a JS Object to an array of Objects in a JSON file
 * @param {string} filename - Name of JSON file
 * @param {object} jsonContentObj - The content to write to the JSON file
 * @param {function} callback - The callback function to execute on error or success
 *                              Callback takes write error as 1st param and JS Object as 2nd param.
 * @returns undefined
 */

// Basically callback allows you to specify a function in which you can add as a parameter that will take the result of the function in question and then further modifies it
export function write(filename, jsonContentObj, callback) {
  // Convert content object to string before writing
  const jsonContentStr = JSON.stringify(jsonContentObj);

  // Write content to DB
  // writeFile('test.txt', content, handleFileWrite);
  // The typical writeFile syntax where you specify 1. filename, content (Which in this case is JsonContentStr, that's why it's automatically referring to the content), an error
  writeFile(filename, jsonContentStr, (writeErr) => {
    if (writeErr) {
      console.error('Write error', jsonContentStr, writeErr);
      // Allow each client app to handle errors in their own way
      callback(writeErr, null);
      return;
    }
    console.log('Write success!');
    // Call client-provided callback on successful write
    // If write success, then callback function will run.
    callback(null, jsonContentStr);
  });
}

/**
 * Read target file, convert contents to Object, call client callback
 * @param {string} filename - JSON DB file name
 * @param {function} handleJsonRead - Callback for successful file read
 *                                    Takes 1 param, JSON content as JS Object
 */

// readFile(filename, 'utf8', handleFileRead); where handleFileRead is the function
// const handleFileRead = (error, content) => {... Second param will be the content which in this case is jsonContentStr
export function read(filename, callback) {
  const handleFileRead = (readErr, jsonContentStr) => {
    // Catch read error if any
    if (readErr) {
      console.error('Read error', readErr);
      // Callback in this case is a function that allows client to define a function that handles the error
      // But why is it necessary to specify a null parameter? ##############################################
      callback(readErr, null);
      return;
    }
    // If no problems reading file,
    // Parse JSON content str into JS Object
    const jsonContentObj = JSON.parse(jsonContentStr);

    // Callback in this case is a function that allows client to define a function that handles the file content
    // Again, why is it necessary to specify a null parameter? ##############################################
    callback(null, jsonContentObj);
  };

  // So what happens here is that,
  // 1. index.js calls the read function,
  // 2. read function will call the readFile function,
  // 3. readFile function will attempt to READ the file via the handleFileRead function
  // 4. handFileRead function will throw error if attempt to READ the file is unsuccessful and if successful, parse the content (i.e., jsonContentStr)
  //   and stores the object in the variable known as jsonContentObj
  // 5. callback function as determined elsewhere would then handle the object (i.e., jsonContentObj)
  readFile(filename, 'utf-8', handleFileRead);
}

/**
 * Add a JS Object to an array of Objects in a JSON file
 * @param {string} filename - Name of JSON file
 * @param {function} callback - The callback function to execute on error or success
 *                              Callback takes read error as 1st param and JS Object as 2nd param.
 * @returns undefined
 */
export function edit(filename, readCallback, writeCallback) {
  // Read contents of target file and perform callback on JSON contents
  // Remember that syntax of function read: read(filename, callback)

  read(filename, (readErr, jsonContentObj) => {
    // Exit if there was a read error
    if (readErr) {
      console.error('Read error', readErr);
      // similar utility as callback function in the case of an error in the read function?
      // i.e., allows the client to define a function to handle the error
      readCallback(readErr, null);
      return;
    }

    // Perform custom edit operations here.
    // jsonContentObj mutated in-place because object is mutable data type.
    // similar utility as callback function when file is successfully read - allows to client to define a function that handles the file content
    // i.e., allows the client to define a function to handle the error
    readCallback(null, jsonContentObj);

    // Write updated content to target file.
    // Infact, the only apparently difference between the read function and the edit function, is its ability to write files
    // write function syntax write(filename, jsonContentObj, callback)
    write(filename, jsonContentObj, writeCallback);
  });
}

/**
 * Add a JS Object to an array of Objects in a JSON file
 * @param {string} filename - Name of JSON file
 * @param {string} key - The key in the JSON file whose value is the target array
 * @param {string} input - The value to append to the target array
 * @param {function} callback - The callback function to execute on error or success
 *                              Callback takes read or write error as 1st param and written string as 2nd param.
 * @returns undefined
 */
// edit function syntax edit(filename, readCallback, writeCallback)
export function add(filename, key, input, callback) {
  // No readCallback or writeCallback parameters specified, like that the function still can work?? ##############################################
  edit(filename, (err, jsonContentObj) => {
    // Exit if there was an error
    if (err) {
      console.error('Edit error', err);
      // in this case not possible to know what went wrong exactly
      // again I think callback is just a function to handle errors
      callback(err);
      return;
    }

    // Exit if key does not exist in DB
    if (!(key in jsonContentObj)) {
      console.error('Key does not exist');
      // Call callback with relevant error message to let client handle
      callback('Key does not exist');
      return;
    }
    // add a key into jsonContentObj. I believe this refers to the primary object's keys? Correct. Looks like add only allows to add more values to the same keys
    // Add input element to target array
    jsonContentObj[key].push(input);
    // console.log(`TEST ${jsonContentObj}`)
    // console.log(`TEST AGAIN ${jsonContentObj[key]}`)
  },
  // Pass callback to edit to be called after edit completion
  callback);
}
