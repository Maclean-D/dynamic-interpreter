function updateTemperatureValue() {
    const temperatureValue = document.getElementById('temperature').value;
    const formattedTemperature = temperatureValue.toFixed(2);
    document.getElementById('temperature-value').textContent = formattedTemperature;
}

const settingsForm = document.getElementById('settings-form');
    settingsForm.addEventListener('reset', () => {
    const temperatureSlider = document.getElementById('temperature');
    temperatureSlider.value = 0.01;
    updateTemperatureValue();
});

function openSettingsDialog() {
    const dialog = document.getElementById('SettingsDialog');
    dialog.show();
}

function openProfileDialog() {
    const dialog = document.getElementById('ProfileDialog');
    dialog.show();
}

function openDebugDialog() {
    const dialog = document.getElementById('DebugDialog');
    dialog.show();
}

function openSystemMessageDialog() {
    const dialog = document.getElementById('SystemMessageDialog');
    dialog.show();
}

const dialog = document.getElementById('SettingsDialog');
dialog.addEventListener('close', () => {
    const cancelClicked = dialog.returnValue === 'cancel';
    const okClicked = dialog.returnValue === 'ok';
});