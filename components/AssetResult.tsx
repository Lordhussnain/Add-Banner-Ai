import React from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface AssetResultProps {
  title: string;
  description: string;
  imageUrl?: string;
  isLoading: boolean;
  onRetry?: () => void;
  className?: string;
}

export const AssetResult: React.FC<AssetResultProps> = ({ 
  title, 
  description, 
  imageUrl, 
  isLoading,
  onRetry,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      
      <div className="relative flex-grow bg-gray-100 min-h-[300px] flex items-center justify-center group">
        {isLoading ? (
          <div className="flex flex-col items-center p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-gray-600 animate-pulse">Designing with Nano Banana...</p>
          </div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <a 
                href={imageUrl} 
                download={`${title.replace(/\s+/g, '-').toLowerCase()}.png`}
                className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition shadow-lg"
                title="Download"
              >
                <Download size={20} />
              </a>
              {onRetry && (
                 <button 
                 onClick={onRetry}
                 className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition shadow-lg"
                 title="Regenerate"
               >
                 <RefreshCw size={20} />
               </button>
              )}
            </div>
          </>
        ) : (
           <div className="text-center p-6">
             <p className="text-gray-400 mb-2">Failed to generate</p>
             {onRetry && (
                 <button 
                 onClick={onRetry}
                 className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
               >
                 <RefreshCw size={14} /> Try Again
               </button>
             )}
           </div>
        )}
      </div>
    </div>
  );
};