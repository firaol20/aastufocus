import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Get images for a specific album (folder)
 * @route   GET /api/gallery/:folder
 * @access  Public
 */
export const getGalleryImages = async (req, res) => {
  try {
    const { folder } = req.params;
    
    // Cloudinary folder path
    const folderPath = `AASTU_Gallery/${folder}`;

    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 100, // Adjust as needed
    });

    const images = resources.map(resource => resource.secure_url);

    res.status(200).json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    console.error('Cloudinary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images from Cloudinary',
      error: error.message
    });
  }
};

/**
 * @desc    Get all gallery albums (subfolders of AASTU_Gallery)
 * @route   GET /api/gallery/albums
 * @access  Public
 */
export const getAlbums = async (req, res) => {
  try {
    // Cloudinary throws an error if the folder doesn't exist
    let albums = [];
    try {
      const { folders } = await cloudinary.api.sub_folders('AASTU_Gallery');
      albums = folders.map(f => f.name);
    } catch (err) {
      // If folder doesn't exist, just return empty list
      if (err.http_code !== 404) {
        throw err;
      }
    }

    res.status(200).json({
      success: true,
      count: albums.length,
      albums
    });
  } catch (error) {
    console.error('Cloudinary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch albums from Cloudinary',
      error: error.message
    });
  }
};

/**
 * @desc    Upload an image to a specific gallery album
 * @route   POST /api/gallery/upload
 * @access  Private (Admin/Leader)
 */
export const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { album } = req.body;
    if (!album) {
      return res.status(400).json({ success: false, message: 'Album name is required' });
    }

    // Cloudinary folder path
    const folderPath = `AASTU_Gallery/${album}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folderPath,
      use_filename: true,
      unique_filename: true,
    });

    // Clean up local file after upload
    import('fs').then(fs => {
      fs.unlinkSync(req.file.path);
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
      album
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary',
      error: error.message
    });
  }
};
