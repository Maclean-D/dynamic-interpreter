async function sendMessage() {
    // Retrieve message input
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    // Only proceed if there's a message
    if (messageText) {
        // Display the user's message on the webpage
        displayMessage(messageText, 'Human');

        // Clear the input
        messageInput.value = '';

        // Send the message to the Open Interpreter via your backend
        try {
            const response = await fetch('/path-to-your-backend-endpoint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();

            // Display Open Interpreter's response on the webpage
            displayMessage(responseData.reply, 'Open Interpreter');

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }
}

// Function to display a message on the webpage
function displayMessage(message, sender) {
    // Create the main message container
    const messageContainer = document.createElement('div');

    // Set the inner HTML of the container based on the sender
    const senderIcon = sender === 'Human' ? 'person' : 'computer';
    const senderName = sender === 'Human' ? 'Human' : 'Open Interpreter';

    messageContainer.innerHTML = `
        <div style="display: flex; align-items: center; margin-left: 1rem;">
            <span class="material-icons">${senderIcon}</span>
            <h3 class="title-large" style="margin-left: 0.5rem;">${senderName}</h3>
        </div>
        <p class="body-large" style="margin-left: 1rem; margin-top: -1rem; margin-bottom: -0.5rem; max-width: calc(50vw - 2.55rem); word-wrap: break-word;">${message}</p>
    `;

    // Append the message to the messages container
    const messagesContainer = document.querySelector('.secondary-container');
    messagesContainer.appendChild(messageContainer);
}

// Send Messages
document.getElementById('send-button').onclick = sendMessage;