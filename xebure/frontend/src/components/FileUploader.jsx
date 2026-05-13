import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadFile } from '../lib/uploadApi';

const FileUploader = ({ onUpload, onCancel, maxSize = 10 * 1024 * 1024 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
        setError(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      } else {
        toast.error(error.message);
        setError(error.message);
      }
      setTimeout(() => setError(null), 3000);
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    // Create preview for images/videos
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    }

    setUploading(true);
    
    try {
      // Upload file to server
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      
      // Call the onUpload callback with the uploaded file data
      onUpload(result.file);
      toast.success(`${file.name} uploaded successfully!`);
      
      // Reset after successful upload
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setFilePreview(null);
        setFileName('');
      }, 500);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
      setUploading(false);
      setUploadProgress(0);
      setTimeout(() => setError(null), 3000);
    }
  }, [onUpload, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt'],
    },
  });

  return (
    <div className="bg-base-200 rounded-xl p-3 mb-2 animate-slideUp relative">
      {!uploading && !filePreview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-base-300 hover:border-primary hover:bg-primary/5'
            }
            ${error ? 'border-red-500 bg-red-500/10' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-base-content/40" />
          <p className="text-sm text-base-content/70">
            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-base-content/40 mt-1">
            Images, videos, documents (Max {maxSize / (1024 * 1024)}MB)
          </p>
          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
        </div>
      ) : uploading ? (
        <div className="space-y-3">
          {filePreview && (
            <div className="relative">
              {filePreview.startsWith('data:image') ? (
                <img src={filePreview} alt="Preview" className="max-h-32 rounded-lg mx-auto" />
              ) : filePreview.startsWith('blob:') ? (
                <video src={filePreview} className="max-h-32 rounded-lg mx-auto" controls />
              ) : null}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-base-content/60">
              <span className="truncate max-w-[200px]">{fileName}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-center text-base-content/50">
              Uploading to server...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {filePreview && (
            <div className="relative">
              {filePreview.startsWith('data:image') ? (
                <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
              ) : filePreview.startsWith('blob:') ? (
                <video src={filePreview} className="w-12 h-12 rounded-lg object-cover" />
              ) : null}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-green-600">Upload complete!</p>
            <p className="text-xs text-base-content/50 truncate">{fileName}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {!uploading && !filePreview && (
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-base-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default FileUploader;