// Fetch the current model from the server when the page loads
window.addEventListener('load', function() {
    fetch('/get-current-model')
        .then(response => response.json())
        .then(data => {
            setCurrentModel(data.currentModel);
        })
        .catch(error => {
            console.error('Error fetching current model:', error);
        });

    // Existing change event listener
    document.getElementById('modelSelect').addEventListener('change', function() {
        var selectedModel = this.value;
        fetch('/change-model', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: selectedModel }),
        })
        .then(response => response.json())
        .then(data => {
            // Only log the success message to the console
            console.log(data.message);
        })
        .catch((error) => {
            // Show an alert if there's an error
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
    });
    
    function setCurrentModel(model) {
        document.getElementById('modelSelect').value = model;
    }
});

//autorun
function fetchAutoRunSetting() {
    fetch('/get-auto-run-setting')
        .then(response => response.json())
        .then(data => {
            setSwitchState(data.autoRun);
        })
        .catch((error) => {
            console.error('Error fetching auto run setting:', error);
        });
}

function setSwitchState(state) {
    const switchElement = document.getElementById('auto-run-switch');
    if (switchElement) {
        switchElement.selected = state;
    }
}

// Call this function when the page loads
fetchAutoRunSetting();

document.getElementById('auto-run-switch').addEventListener('change', function() {
    console.log('Switch state:', this.selected); // Debugging line
    updateAutoRunSetting(this.selected);
});

function updateAutoRunSetting(autoRun) {
    const payload = JSON.stringify({ autoRun: autoRun });
    console.log('Sending payload:', payload); // Debugging line

    fetch('/update-auto-run', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: payload,
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch((error) => {
        console.error('Error:', error);
    });
}

//Cloud or Local Model
function fetchLocalSetting() {
    fetch('/get-local-setting')
        .then(response => response.json())
        .then(data => {
            setActiveTab(data.local);
        })
        .catch((error) => {
            console.error('Error fetching local setting:', error);
        });
}

function setActiveTab(isLocal) {
    const tabsElement = document.getElementById('provider-tabs');
    if (tabsElement) {
        // Assuming the first tab is for Cloud (local: false) and the second tab is for Local (local: true)
        tabsElement.activeTabIndex = isLocal ? 1 : 0;
    }
}

// Call this function when the page loads
fetchLocalSetting();

document.getElementById('provider-tabs').addEventListener('change', function(event) {
    // Assuming the first tab (index 0) is Cloud Provider and the second tab (index 1) is Local Model
    const isLocal = event.target.activeTabIndex === 1;
    updateLocalSetting(isLocal);
    toggleModelSelectDropdown(!isLocal);
});

function updateLocalSetting(isLocal) {
    fetch('/update-local-setting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ local: isLocal }),
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch((error) => {
        console.error('Error:', error);
    });
}

function toggleModelSelectDropdown(show) {
    const modelSelectDropdown = document.getElementById('modelSelect');
    if (modelSelectDropdown) {
        modelSelectDropdown.style.display = show ? 'block' : 'none';
    }
}
