import React, { useState } from 'react';
import { AspectRatio, ImageSize } from '../types';
import { generateProAsset } from '../services/geminiService';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface ProStudioProps {
  productName: string;
  productDesc: string;
  visualAnalysis: string;
}

export const ProStudio: React.FC<ProStudioProps> = ({ productName, productDesc, visualAnalysis }) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE_1_1);
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Construct a rich prompt based on analysis + overrides
      const fullPrompt = `
        Professional studio photograph of ${productName}.
        Context: ${productDesc}.
        Visual Details: ${visualAnalysis}.
        Additional Requirements: ${customPrompt || 'High key lighting, photorealistic, 8k resolution'}.
        Ensure the product looks premium and the background is clean.
      `;

      const image = await generateProAsset(fullPrompt, aspectRatio, size);
      if (image) {
        setResultImage(image);
      }
    } catch (e) {
      console.error(e);
      alert("Pro generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          Nano Banana Pro Studio
        </h2>
        <p className="text-purple-100 mt-1">Generate high-fidelity concepts with advanced controls.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(AspectRatio).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    aspectRatio === ratio
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
            <div className="flex gap-2">
              {Object.values(ImageSize).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition ${
                    size === s
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instruction (Optional)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. 'Place it on a marble table with morning sunlight'"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm h-24 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg font-bold text-white transition shadow-lg
              ${isGenerating ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'}
            `}
          >
            {isGenerating ? 'Generating High-Res Asset...' : 'Generate Pro Asset'}
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center p-4 min-h-[400px]">
          {resultImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
                <img 
                    src={resultImage} 
                    alt="Pro Result" 
                    className="max-w-full max-h-[500px] object-contain shadow-2xl rounded-lg"
                />
                 <a 
                href={resultImage} 
                download={`pro-studio-${productName.replace(/\s+/g, '-')}.png`}
                className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur text-purple-900 rounded-full hover:bg-white transition shadow-lg"
                title="Download"
              >
                <Sparkles size={20} />
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Configure settings and click generate to see the magic.</p>
              <p className="text-xs mt-2 text-purple-400">Powered by gemini-3-pro-image-preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};