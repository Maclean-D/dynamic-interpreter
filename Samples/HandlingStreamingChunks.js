let messages = []; //variable to hold all messages
let currentMessageIndex = 0; //variable to keep track of the current message index
let isGenerating = false; //variable to stop the stream

// Function to send a POST request to the OI
async function sendRequest() {
  // Temporary message to hold the message that is being processed
  try {
    // Define parameters for the POST request, add at least the full messages array, but you may also consider adding any other OI parameters here, like auto_run, local, etc.
    const params = {
      messages,
    };

    //Define a controller to allow for aborting the request
    const controller = new AbortController();
    const { signal } = controller;

    // Send the POST request to your Python server endpoint
    const interpreterCall = await fetch("https://YOUR_ENDPOINT/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      signal,
    });

    // Throw an error if the request was not successful
    if (!interpreterCall.ok) {
      console.error("Interpreter didn't respond with 200 OK");
      return;
    }

    // Initialize a reader for the response body
    const reader = interpreterCall.body.getReader();

    isGenerating = true;
    while (true) {
      const { value, done } = await reader.read();

      // Break the loop if the stream is done
      if (done) {
        break;
      }
      // If isGenerating is set to false, cancel the reader and break the loop. This will halt the execution of the code run by OI as well
      if (!isGenerating) {
        await reader.cancel();
        controller.abort();
        break;
      }
      // Decode the stream and split it into lines
      const text = new TextDecoder().decode(value);
      const lines = text.split("\n");
      lines.pop(); // Remove last empty line

      // Process each line of the response
      for (const line of lines) {
        const chunk = JSON.parse(line);
        await processChunk(chunk);
      }
    }
    //Stream has completed here, so run any code that needs to be run after the stream has finished
    if (isGenerating) isGenerating = false;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

//Function to process each chunk of the stream, and create messages
function processChunk(chunk) {
  if (chunk.start) {
    const tempMessage = {};
    //add the new message's data to the tempMessage
    tempMessage.role = chunk.role;
    tempMessage.type = chunk.type;
    tempMessage.content = "";
    if (chunk.format) tempMessage.format = chunk.format;
    if (chunk.recipient) tempMessage.recipient = chunk.recipient;

    //add the new message to the messages array, and set the currentMessageIndex to the index of the new message
    messages.push(tempMessage);
    currentMessageIndex = messages.length - 1;
  }

  //Handle active lines for code blocks
  if (chunk.format === "active_line") {
    messages[currentMessageIndex].activeLine = chunk.content;
  } else if (chunk.end && chunk.type === "console") {
    messages[currentMessageIndex].activeLine = null;
  }

  //Add the content of the chunk to current message, avoiding adding the content of the active line
  if (chunk.content && chunk.format !== "active_line") {
    messages[currentMessageIndex].content += chunk.content;
  }
}