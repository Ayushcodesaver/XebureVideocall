import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { upload, uploadMultiple } from '../config/multer.js';
import { uploadFile, uploadMultipleFiles, deleteFile } from '../controllers/upload.controller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Single file upload
router.post('/single', upload.single('file'), uploadFile);

// Multiple files upload
router.post('/multiple', uploadMultiple, uploadMultipleFiles);

// Delete file
router.delete('/file', deleteFile);

export default router;