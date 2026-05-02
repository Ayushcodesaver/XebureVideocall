import { upload } from '../config/multer.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Upload single file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fileType = file.mimetype.split('/')[0];
    
    let fileUrl = null;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: fileType === 'video' ? 'video' : 'auto',
        folder: 'xebure-chat',
      });
      fileUrl = result.secure_url;
      fs.unlinkSync(file.path);
    } else {
      fileUrl = `/uploads/${file.filename}`;
    }

    res.status(200).json({
      success: true,
      file: {
        url: fileUrl,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

// ✅ ADD THIS FUNCTION - Upload multiple files
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileType = file.mimetype.split('/')[0];
      let fileUrl = null;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: fileType === 'video' ? 'video' : 'auto',
          folder: 'xebure-chat',
        });
        fileUrl = result.secure_url;
        fs.unlinkSync(file.path);
      } else {
        fileUrl = `/uploads/${file.filename}`;
      }

      uploadedFiles.push({
        url: fileUrl,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      });
    }

    res.status(200).json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    
    if (fileUrl && fileUrl.includes('cloudinary')) {
      const publicId = fileUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'File deletion failed' });
  }
};