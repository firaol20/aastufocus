import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../../frontend/public');

const MISC_IMAGES = [
  'banner.jpg', 'bible-study.png', 'bible.jpg', 'break-mission.jpg',
  'events.png', 'events.jpg', 'gallery.jpg', 'hero-image.jpg',
  'hero-image.png', 'hero-image1.png', 'location_image.png',
  'logo.png', 'worship-night.jpg', 'worship.jpg',
];

async function uploadFolder(folderPath, cloudinaryFolder) {
  if (!fs.existsSync(folderPath)) {
    console.warn('Directory not found: ' + folderPath);
    return {};
  }
  const files = fs.readdirSync(folderPath);
  const results = {};
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (fs.lstatSync(filePath).isDirectory()) continue;
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) continue;
    try {
      const publicId = path.parse(file).name;
      console.log('Uploading ' + file + ' to ' + cloudinaryFolder);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: cloudinaryFolder,
        public_id: publicId,
        overwrite: true,
        use_filename: false,
      });
      results[file] = result.secure_url;
      console.log('  OK: ' + result.secure_url);
    } catch (error) {
      console.error('  FAIL ' + file + ': ' + error.message);
    }
  }
  return results;
}

async function uploadMiscImages() {
  const results = {};
  for (const file of MISC_IMAGES) {
    const filePath = path.join(PUBLIC_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn('Not found: ' + file);
      continue;
    }
    try {
      const publicId = path.parse(file).name;
      console.log('Uploading ' + file + ' to AASTU_Misc');
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'AASTU_Misc',
        public_id: publicId,
        overwrite: true,
        use_filename: false,
      });
      results[file] = result.secure_url;
      console.log('  OK: ' + result.secure_url);
    } catch (error) {
      console.error('  FAIL ' + file + ': ' + error.message);
    }
  }
  return results;
}

async function main() {
  console.log('Starting Cloudinary upload...');

  console.log('\n--- Teams Images ---');
  const teamsResults = await uploadFolder(
    path.join(PUBLIC_DIR, 'Teams'),
    'AASTU_Teams'
  );

  console.log('\n--- Hero Section Images ---');
  const heroResults = await uploadFolder(
    path.join(PUBLIC_DIR, 'hero-section'),
    'AASTU_Hero'
  );

  console.log('\n--- Misc Root Images ---');
  const miscResults = await uploadMiscImages();

  console.log('\n========== RESULTS ==========');
  console.log('\nTeams:');
  for (const [file, url] of Object.entries(teamsResults)) {
    console.log('  ' + file + ' => ' + url);
  }
  console.log('\nHero:');
  for (const [file, url] of Object.entries(heroResults)) {
    console.log('  ' + file + ' => ' + url);
  }
  console.log('\nMisc:');
  for (const [file, url] of Object.entries(miscResults)) {
    console.log('  ' + file + ' => ' + url);
  }

  console.log('\nDone!');
}

main().catch(console.error);
