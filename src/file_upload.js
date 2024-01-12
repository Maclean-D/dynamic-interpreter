function fetchAndDisplayFiles() {
    console.log("Fetching and displaying files...");

    fetch('/list-files')
    .then(response => response.json())
    .then(data => {
        console.log("Files received:", data.files);
        if (data.files) {
            displayUploadedFiles(data.files.map(fileName => ({ name: fileName })));
        }
    })
    .catch(error => console.error('Error fetching files:', error));
}


document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayFiles();
});


function uploadFiles() {
    console.log("Attempting to upload files");
    var files = document.getElementById('file_input').files;
    var formData = new FormData();

    for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayUploadedFiles(files); // Function to display the uploaded files
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayUploadedFiles(files) {
    var filesContainer = document.getElementById('current-files');

    for (var i = 0; i < files.length; i++) {
        var fileDiv = document.createElement('div');
        fileDiv.style.display = 'flex';
        fileDiv.style.alignItems = 'center';

        var icon = document.createElement('i');
        icon.className = 'material-icons';
        icon.style.marginRight = '5px';
        icon.textContent = 'description';

        var p = document.createElement('p');
        p.className = 'body-large';
        p.style.marginRight = '5px';
        p.textContent = files[i].name;

        var deleteButton = document.createElement('md-outlined-icon-button');
        deleteButton.style.marginLeft = 'auto';
        var deleteIcon = document.createElement('i');
        deleteIcon.className = 'material-icons';
        deleteIcon.style.color = 'var(--md-sys-color-error)';
        deleteIcon.textContent = 'delete';
        deleteButton.appendChild(deleteIcon);

        // Attach event listener to this delete button
        deleteButton.addEventListener('click', function() {
            var parentDiv = this.parentNode;
            var nextDivider = parentDiv.nextSibling;
            var fileName = parentDiv.querySelector('p.body-large').textContent;

            // Send delete request to the server
            fetch('/delete-file/' + encodeURIComponent(fileName), { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                // Remove the file entry from the UI
                filesContainer.removeChild(parentDiv);
                if (nextDivider && nextDivider.tagName === 'MD-DIVIDER') {
                    filesContainer.removeChild(nextDivider);
                }
            })
            .catch(error => console.error('Error:', error));
        });

        fileDiv.appendChild(icon);
        fileDiv.appendChild(p);
        fileDiv.appendChild(deleteButton);

        filesContainer.appendChild(fileDiv);

        if (i < files.length - 1) {
            var divider = document.createElement('md-divider');
            divider.style.marginTop = '0.5rem';
            divider.style.marginBottom = '0.5rem';
            filesContainer.appendChild(divider);
        }
    }
}
