import React, { useState } from 'react';
import { Upload, X, Wand2 } from 'lucide-react';
import { ProductData } from '../types';
import { generateProductDescription } from '../services/geminiService';

interface InputFormProps {
  onAnalyze: (data: ProductData) => void;
  isAnalyzing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isAnalyzing }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract pure base64 and mime type
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          setImage({
            url: base64String,
            mimeType: matches[1],
            base64: matches[2]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoFill = async () => {
    if (!name) return;
    setIsAutoFilling(true);
    try {
      const generatedDesc = await generateProductDescription(name);
      setDescription(generatedDesc);
    } catch (error) {
      console.error("Failed to auto-fill", error);
      // Optional: show error toast or message
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && image) {
      onAnalyze({
        name,
        description,
        imageBase64: image.base64,
        mimeType: image.mimeType
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
        Product Details
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Image</label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 transition hover:border-blue-500 bg-gray-50 text-center">
            {image ? (
              <div className="relative inline-block">
                <img src={image.url} alt="Preview" className="h-48 rounded-md object-contain mx-auto" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">Click to upload product photo</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP supported</p>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Classic Leather Sneakers"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
            maxLength={500}
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={!name || isAutoFilling || isAnalyzing}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition
                ${!name || isAutoFilling 
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                  : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium'}`}
              title={!name ? "Enter a product name first" : "Search web for details"}
            >
              <Wand2 size={12} />
              {isAutoFilling ? 'Searching Web...' : 'Auto-fill from Web'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product, its key features, and target audience..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition h-32 resize-none"
            required
            maxLength={5000}
          />
          <div className="text-right text-xs text-gray-400">
            {description.length}/5000
          </div>
        </div>

        <button
          type="submit"
          disabled={!name || !description || !image || isAnalyzing}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all transform active:scale-95
            ${(!name || !description || !image || isAnalyzing) 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Product...
            </span>
          ) : 'Generate Assets'}
        </button>
      </form>
    </div>
  );
};