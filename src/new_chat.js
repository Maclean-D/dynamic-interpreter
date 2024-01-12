function clearChatMessages() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';  // Clears all child elements
    }
}

function clearChatAndFiles() {
    clearChatMessages(); // Clears chat messages

    // Clear the files displayed in the 'current-files' div
    const filesDisplay = document.getElementById('current-files');
    if (filesDisplay) {
        filesDisplay.innerHTML = '';  // Clears the displayed files
    }

    // Send a request to the server to clear files
    fetch('/clear-files', { method: 'POST' })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error('Error:', error));
}

// Attach the clearChatAndFiles function to the click event of the button
const newChatButton = document.querySelector('md-fab[variant="primary"][label="New Chat"]');
if (newChatButton) {
    newChatButton.addEventListener('click', clearChatAndFiles);
}