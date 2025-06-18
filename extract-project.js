const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');

function extractZipFile() {
  yauzl.open('NVW-Project.zip', { lazyEntries: true }, (err, zipfile) => {
    if (err) {
      console.error('Error opening ZIP file:', err);
      return;
    }

    zipfile.readEntry();
    
    zipfile.on('entry', (entry) => {
      const fileName = entry.fileName;
      
      if (/\/$/.test(fileName)) {
        // Directory entry
        const dirPath = path.join(process.cwd(), fileName);
        fs.mkdirSync(dirPath, { recursive: true });
        zipfile.readEntry();
      } else {
        // File entry
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            console.error('Error reading entry:', err);
            return;
          }
          
          const filePath = path.join(process.cwd(), fileName);
          const dirPath = path.dirname(filePath);
          
          // Ensure directory exists
          fs.mkdirSync(dirPath, { recursive: true });
          
          const writeStream = fs.createWriteStream(filePath);
          readStream.pipe(writeStream);
          
          writeStream.on('close', () => {
            console.log(`Extracted: ${fileName}`);
            zipfile.readEntry();
          });
        });
      }
    });

    zipfile.on('end', () => {
      console.log('ZIP extraction completed successfully!');
    });
  });
}

extractZipFile();