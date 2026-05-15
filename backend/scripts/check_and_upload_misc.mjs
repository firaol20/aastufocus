import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PUBLIC = path.join(__dirname, '../../frontend/public');

// Check what's already uploaded
const existing = await cloudinary.api.resources({ type: 'upload', prefix: 'AASTU_Misc', max_results: 50 });
const uploaded = new Set(existing.resources.map(r => r.public_id.split('/').pop()));
console.log('Already uploaded:', [...uploaded].join(', '));

const files = ['events.png','gallery.jpg','hero-image.jpg','hero-image.png','hero-image1.png','location_image.png','logo.png','worship-night.jpg','worship.jpg'];

for (const file of files) {
  const pid = path.parse(file).name;
  if (uploaded.has(pid)) { console.log('skip (exists): ' + file); continue; }
  const fp = path.join(PUBLIC, file);
  if (!existsSync(fp)) { console.log('skip (missing): ' + file); continue; }
  try {
    const r = await cloudinary.uploader.upload(fp, { folder: 'AASTU_Misc', public_id: pid, overwrite: true });
    console.log('OK: ' + file + ' => ' + r.secure_url);
  } catch(e) {
    console.error('FAIL: ' + file + ': ' + e.message);
  }
}
console.log('done');
