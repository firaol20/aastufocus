import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../../frontend/public');
const ALBUMS = [
  '2nd year Retreat 2026',
  'Sandafa and Alaltu Break Mission 2026',
  '14th Anniversary 2026',
  'Easter Program 2026'
];

async function uploadImages() {
  console.log('Starting upload to Cloudinary...');

  for (const album of ALBUMS) {
    const albumPath = path.join(PUBLIC_DIR, album);
    
    if (!fs.existsSync(albumPath)) {
      console.warn(`Album directory not found: ${albumPath}`);
      continue;
    }

    const files = fs.readdirSync(albumPath);
    console.log(`Processing album: ${album} (${files.length} files)`);

    for (const file of files) {
      const filePath = path.join(albumPath, file);
      
      // Skip directories if any
      if (fs.lstatSync(filePath).isDirectory()) continue;

      // Skip non-image files (basic check)
      if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) continue;

      try {
        console.log(`Uploading ${file} to folder "AASTU_Gallery/${album}"...`);
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `AASTU_Gallery/${album}`,
          use_filename: true,
          unique_filename: false,
        });
        console.log(`Uploaded: ${result.secure_url}`);
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error.message);
      }
    }
  }

  console.log('Upload process completed!');
}

uploadImages();
