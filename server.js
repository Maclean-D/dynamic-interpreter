const http = require('http');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
    // First, check if this is a file upload request
    if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
        console.log('Upload request received');
        const form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, 'current_files');
        form.keepExtensions = true;

        form.on('fileBegin', (name, file) => {
            // Use the original filename
            file.filepath = path.join(form.uploadDir, file.originalFilename);
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error during file upload:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('An error occurred during file upload');
                return;
            }
            console.log('Files uploaded:', files);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'File uploaded successfully', files }));
        });
        return;
    }

    if (req.url === '/clear-files' && req.method.toLowerCase() === 'post') {
        const directory = path.join(__dirname, 'current_files');

        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Could not list the directory.', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Failed to delete files' }));
            } else {
                for (const file of files) {
                    fs.unlink(path.join(directory, file), err => {
                        if (err) console.error('Error deleting file', file, err);
                    });
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Files deleted successfully' }));
            }
        });
        return;
    }

    if (req.url.startsWith('/delete-file') && req.method.toLowerCase() === 'post') {
        const fileName = decodeURIComponent(path.basename(req.url.replace('/delete-file/', '')));
        const filePath = path.join(__dirname, 'current_files', fileName);
    
        console.log('Attempting to delete file:', filePath);
    
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', fileName, err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Failed to delete file' }));
                return;
            }
            console.log('File deleted successfully:', fileName);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'File deleted successfully' }));
        });
        return;
    }    

    if (req.url === '/list-files' && req.method.toLowerCase() === 'get') {
        const directory = path.join(__dirname, 'current_files');
    
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Could not list the directory.', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Failed to list files' }));
                return;
            }
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ files }));
        });
        return;
    }    

    if (req.url === '/list-file-paths' && req.method.toLowerCase() === 'get') {
        const directory = path.join(__dirname, 'current_files');
    
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Could not list the directory.', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Failed to list file paths' }));
                return;
            }
    
            // Check if there are no files in the directory
            if (files.length === 0) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('No files selected for use');
                return;
            }
    
            const filePaths = files.map(file => path.join(directory, file)).join('\n');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(filePaths);
        });
        return;
    }
    

    if (req.url === '/change-model' && req.method.toLowerCase() === 'post') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { model } = JSON.parse(body);
            updateConfig(model);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Model updated successfully' }));
        });
        return;
    }

    if (req.url === '/get-current-model' && req.method.toLowerCase() === 'get') {
        fs.readFile(path.join(__dirname, 'config.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading config file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error reading config file' }));
                return;
            }
            const config = JSON.parse(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ currentModel: config.model }));
        });
        return;
    }

    if (req.url === '/get-auto-run-setting' && req.method.toLowerCase() === 'get') {
        fs.readFile(path.join(__dirname, 'config.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading config file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error reading config file' }));
                return;
            }
            const config = JSON.parse(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ autoRun: config.auto_run }));
        });
        return;
    }

    if (req.url === '/update-auto-run' && req.method.toLowerCase() === 'post') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const parsedBody = JSON.parse(body);
            console.log("Received autoRun value:", parsedBody.autoRun); // Log for debugging
            updateAutoRun(parsedBody.autoRun);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Auto run setting updated successfully' }));
        });
        return;
    }

    if (req.url === '/update-local-setting' && req.method.toLowerCase() === 'post') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { local } = JSON.parse(body);
            updateLocalConfig(local);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Local setting updated successfully' }));
        });
        return;
    }

    if (req.url === '/get-local-setting' && req.method.toLowerCase() === 'get') {
        fs.readFile(path.join(__dirname, 'config.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading config file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error reading config file' }));
                return;
            }
            const config = JSON.parse(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ local: config.local }));
        });
        return;
    }

    // For other requests, serve static files
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    const contentType = getContentType(extname);

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('File Not Found');
            } else {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        } else {
            res.setHeader('Content-Type', contentType);
            res.end(content);
        }
    });
});


const port = 3000;
server.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`);
    const openModule = await import('open');
    openModule.default(`http://localhost:${port}`);
});

function getContentType(extname) {
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        case '.json':
            return 'application/json';
        default:
            return 'text/plain';
    }
}

function updateConfig(newModel) {
    const configPath = path.join(__dirname, 'config.json');
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config file:', err);
            return;
        }
        let config = JSON.parse(data);
        config.model = newModel;
        fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
            if (err) console.error('Error writing to config file:', err);
        });
    });
}

function updateAutoRun(autoRun) {
    const configPath = path.join(__dirname, 'config.json');
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config file:', err);
            return;
        }
        let config = JSON.parse(data);

        // Check if autoRun is a boolean and update, otherwise log an error
        if (typeof autoRun === 'boolean') {
            config.auto_run = autoRun;
        } else {
            console.error('Invalid autoRun value:', autoRun);
            return;
        }

        fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
            if (err) console.error('Error writing to config file:', err);
        });
    });
}

function updateLocalConfig(local) {
    const configPath = path.join(__dirname, 'config.json');
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config file:', err);
            return;
        }
        let config = JSON.parse(data);
        config.local = local;
        fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
            if (err) console.error('Error writing to config file:', err);
        });
    });
}