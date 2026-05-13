import { useState } from "react";
import { Video, Image } from "lucide-react";
import MediaViewer from "./MediaViewer";
import VoiceMessageBubble from "./VoiceMessageBubble";

const CustomMessage = ({ message, isMyMessage }) => {
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handleMediaClick = (attachments, index) => {
    const mediaList = attachments.map(att => ({
      url: att.asset_url,
      type: att.type === 'image' || att.type?.startsWith('image/') || att.mime_type === 'image/gif' || att.asset_url?.includes('.gif') ? 'image' : 'video'
    }));
    setCurrentMedia(mediaList);
    setCurrentMediaIndex(index);
    setMediaViewerOpen(true);
  };

  // Check if message has attachments
  if (message.attachments && message.attachments.length > 0) {
    return (
      <>
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2`}>
          <div className={`max-w-[70%] ${isMyMessage ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'} rounded-2xl px-4 py-2`}>
            {message.attachments.map((attachment, idx) => {
              // Voice message
              if (attachment.type === "audio") {
                return (
                  <VoiceMessageBubble 
                    key={idx} 
                    audioUrl={attachment.asset_url} 
                  />
                );
              }
              
              // GIF or Image
              if (attachment.type === "image" || 
                  attachment.type?.startsWith('image/') || 
                  attachment.mime_type === "image/gif" ||
                  attachment.asset_url?.includes('.gif') ||
                  attachment.asset_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                return (
                  <button
                    key={idx}
                    onClick={() => handleMediaClick(message.attachments, idx)}
                    className="max-w-[200px] rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <img 
                      src={attachment.asset_url} 
                      alt={attachment.title || "GIF"}
                      className="w-full h-auto"
                    />
                  </button>
                );
              }
              
              // Video
              if (attachment.type === "video" || attachment.type?.startsWith('video/')) {
                return (
                  <button
                    key={idx}
                    onClick={() => handleMediaClick(message.attachments, idx)}
                    className="max-w-[200px] rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer relative"
                  >
                    <video 
                      src={attachment.asset_url} 
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  </button>
                );
              }
              
              // File attachment
              return (
                <div key={idx} className="flex items-center gap-2 p-2 bg-base-300 rounded-lg">
                  <Paperclip className="w-4 h-4" />
                  <a href={attachment.asset_url} download className="text-sm hover:underline">
                    {attachment.title || "Download"}
                  </a>
                </div>
              );
            })}
            
            {/* Message text if any */}
            {message.text && message.text !== "🎤 Voice message" && message.text !== "🎬 GIF" && (
              <p className="mt-1 text-sm">{message.text}</p>
            )}
          </div>
        </div>
        
        {/* Media Viewer Modal */}
        {mediaViewerOpen && (
          <MediaViewer 
            media={currentMedia}
            onClose={() => setMediaViewerOpen(false)}
            initialIndex={currentMediaIndex}
          />
        )}
      </>
    );
  }

  // Regular text message
  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] ${isMyMessage ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'} rounded-2xl px-4 py-2`}>
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export default CustomMessage;