function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto'; // Reset height to recalculate
    textarea.style.height = textarea.scrollHeight + 'px'; // Set new height
}

document.getElementById('message-input').addEventListener('input', function() {
    adjustTextareaHeight(this);
});

window.onload = function() {
    adjustTextareaHeight(document.getElementById('message-input'));
};

// Check if the browser supports speech recognition
if ('webkitSpeechRecognition' in window) {
var recognition = new webkitSpeechRecognition();
var isRecognizing = false; // Flag to track recognition state
var micIcon = document.querySelector('.mic i'); // Select the microphone icon

// Continuous recognition and interim results
recognition.continuous = true;
recognition.interimResults = true;

// Event handler for result event
recognition.onresult = function(event) {
    var transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
    transcript += event.results[i][0].transcript;
    }
    // Update textbox with the transcript
    document.getElementById('message-input').value = transcript;
};

// Event handler for end event
recognition.onend = function() {
    console.log('Recognition ended'); // Debug message
    isRecognizing = false;
    micIcon.style.color = ''; // Revert the icon color
};

// Event handler for errors
recognition.onerror = function(event) {
console.log('Recognition error: ' + event.error); // Debug message
if (event.error === 'network') {
    alert('Network error during speech recognition. Please check your internet connection or use a supported browser like Chrome.)');
}
isRecognizing = false;
micIcon.style.color = ''; // Revert the icon color
};

// Toggle recognition and icon color when the microphone button is clicked
document.querySelector('.mic').addEventListener('click', function() {
    if (isRecognizing) {
    recognition.stop();
    } else {
    recognition.start();
    isRecognizing = true;
    micIcon.style.color = 'var(--md-sys-color-error)'; // Change icon color
    }
});
} else {
console.log('Speech recognition not supported in this browser.');
}