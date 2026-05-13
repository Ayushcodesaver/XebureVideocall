import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { upload, uploadMultiple } from '../config/multer.js';
import { uploadFile, uploadMultipleFiles, deleteFile } from '../controllers/upload.controller.js';

const router = express.Router();

// ✅ Single file upload
router.post('/single', protectRoute, upload.single('file'), uploadFile);

// ✅ Multiple files upload
router.post('/multiple', protectRoute, uploadMultiple, uploadMultipleFiles);

// ✅ Delete file
router.delete('/file', protectRoute, deleteFile);

export default router;