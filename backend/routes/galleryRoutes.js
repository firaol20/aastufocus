import express from 'express';
import { 
  getGalleryImages, 
  getAlbums, 
  uploadGalleryImage 
} from '../controllers/galleryController.js';
import { uploadImage } from '../config/multer.js';
import { verifyJWT, requireLeader } from '../middleware/auth.js';

const router = express.Router();

router.get('/albums', getAlbums);
router.get('/:folder', getGalleryImages);

// Admin/Leader only upload
router.post('/upload', verifyJWT, requireLeader, uploadImage, uploadGalleryImage);

export default router;
