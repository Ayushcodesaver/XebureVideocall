import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload single file to Cloudinary
export const uploadFile = async (req, res) => {
  console.log("📁 Upload request received");
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    console.log("📁 File received:", file.originalname);
    console.log("📁 File size:", file.size);
    console.log("📁 File type:", file.mimetype);
    
    // Determine resource type for Cloudinary
    let resourceType = 'auto';
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('audio/')) {
      resourceType = 'raw';
    }
    
    console.log(`☁️ Uploading to Cloudinary as ${resourceType}...`);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: 'xebure-chat',
      use_filename: true,
      unique_filename: true,
    });
    
    console.log("✅ Cloudinary upload successful:", result.secure_url);
    
    // Delete local file after upload
    try {
      fs.unlinkSync(file.path);
      console.log("📁 Local file deleted:", file.path);
    } catch (err) {
      console.log("⚠️ Could not delete local file:", err.message);
    }
    
    res.status(200).json({
      success: true,
      file: {
        url: result.secure_url,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    
    // Clean up local file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.log("⚠️ Could not delete local file:", err.message);
      }
    }
    
    res.status(500).json({ 
      message: 'File upload failed', 
      error: error.message,
    });
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      let resourceType = 'auto';
      if (file.mimetype.startsWith('video/')) resourceType = 'video';
      else if (file.mimetype.startsWith('image/')) resourceType = 'image';
      else if (file.mimetype.startsWith('audio/')) resourceType = 'raw';
      
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: resourceType,
        folder: 'xebure-chat',
      });
      
      try {
        fs.unlinkSync(file.path);
      } catch (err) {}
      
      uploadedFiles.push({
        url: result.secure_url,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        publicId: result.public_id,
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

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log("✅ File deleted from Cloudinary:", publicId);
    }
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'File deletion failed' });
  }
};