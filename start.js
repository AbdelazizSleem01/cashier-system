const { exec } = require('child_process');
const path = require('path');

console.log('Starting MongoDB...');
const mongoPath = path.join(__dirname, 'mongodb-portable', 'bin', 'mongod.exe');
const dbPath = path.join(__dirname, 'data', 'db');

// تشغيل MongoDB
exec(`"${mongoPath}" --dbpath "${dbPath}" --port 27017`, (err, stdout, stderr) => {
    if (err) {
        console.error('Failed to start MongoDB:', stderr);
        return;
    }
    console.log('MongoDB started successfully.');

    // تشغيل تطبيقك
    console.log('Starting Electron app...');
    exec('npm run electron', (err, stdout, stderr) => {
        if (err) {
            console.error('Failed to start Electron app:', stderr);
        }
    });
});