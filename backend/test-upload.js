const fs = require('fs');
const path = require('path');
const http = require('http');

function createMultipartData(imagePath, boundary) {
  const imageData = fs.readFileSync(imagePath);
  const filename = path.basename(imagePath);
  
  let data = '';
  data += `--${boundary}\r\n`;
  data += `Content-Disposition: form-data; name="image"; filename="${filename}"\r\n`;
  data += `Content-Type: image/jpeg\r\n\r\n`;
  
  const header = Buffer.from(data, 'utf8');
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  
  return Buffer.concat([header, imageData, footer]);
}

async function testImageUpload() {
  try {
    // Use an existing image from the uploads folder
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    const imageFile = files.find(f => f.includes('.jpg'));
    
    if (!imageFile) {
      console.log('No test image found in uploads folder');
      return;
    }
    
    console.log(`Using existing image: ${imageFile}`);
    const imagePath = path.join(uploadsDir, imageFile);
    
    const boundary = '----formdata-boundary-' + Math.random().toString(36);
    const postData = createMultipartData(imagePath, boundary);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/upload-image',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Upload test result:', JSON.stringify(result, null, 2));
        } catch (e) {
          console.log('Raw response:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testImageUpload();
