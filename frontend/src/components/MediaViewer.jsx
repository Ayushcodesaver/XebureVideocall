import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const MediaViewer = ({ media, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : media.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev < media.length - 1 ? prev + 1 : 0));
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [media.length, onClose]);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.type === 'video';

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentMedia?.url;
    link.download = `media-${Date.now()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous Button */}
      {media.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {media.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
        aria-label="Download"
      >
        <Download className="w-5 h-5" />
      </button>

      {/* Media Content */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {isVideo ? (
          <video
            src={currentMedia?.url}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={currentMedia?.url}
            alt="Media content"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
            loading="lazy"
          />
        )}
      </div>

      {/* Counter */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>
  );
};

export default MediaViewer;