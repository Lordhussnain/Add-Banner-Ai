import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { AssetResult } from './components/AssetResult';
import { ProStudio } from './components/ProStudio';
import { analyzeProduct, generateMarketingAsset } from './services/geminiService';
import { ProductData, AnalysisResult } from './types';
import { Layers, Image, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Generated Asset State
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [studioFrontUrl, setStudioFrontUrl] = useState<string | undefined>(undefined);
  const [studioAngleUrl, setStudioAngleUrl] = useState<string | undefined>(undefined);
  
  // Loading States
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [loadingStudio1, setLoadingStudio1] = useState(false);
  const [loadingStudio2, setLoadingStudio2] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'standard' | 'pro'>('standard');

  const handleAnalyze = async (data: ProductData) => {
    setProductData(data);
    setIsAnalyzing(true);
    setAnalysis(null);
    setBannerUrl(undefined);
    setStudioFrontUrl(undefined);
    setStudioAngleUrl(undefined);

    try {
      // 1. Analyze
      if(!data.imageBase64) throw new Error("No image");
      const analysisResult = await analyzeProduct(data.name, data.description, data.imageBase64, data.mimeType);
      setAnalysis(analysisResult);
      
      // 2. Start Generations
      generateAllAssets(data, analysisResult);

    } catch (error) {
      console.error(error);
      alert("Failed to analyze product. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAllAssets = (data: ProductData, analysisRes: AnalysisResult) => {
    if (!data.imageBase64) return;

    // Banner Generation
    setLoadingBanner(true);
    const bannerPrompt = `
      Create a ${analysisRes.recommendedBannerStyle} advertisement banner.
      Product Name: "${data.name}".
      Headline: "${analysisRes.marketingHooks[0]}".
      Style: ${analysisRes.recommendedBannerStyle}.
      Color Palette: ${analysisRes.colorPalette}.
      Make it look professional and high-click-through-rate.
    `;
    generateMarketingAsset(data.imageBase64, data.mimeType, bannerPrompt)
      .then(url => url && setBannerUrl(url))
      .catch(e => console.error("Banner failed", e))
      .finally(() => setLoadingBanner(false));

    // Studio Front
    setLoadingStudio1(true);
    const studio1Prompt = `
      Place this product on a pure white background. 
      Professional studio lighting. 
      Front view. 
      High resolution, sharp details.
      Keep the product exactly as it is, just change the background.
    `;
    generateMarketingAsset(data.imageBase64, data.mimeType, studio1Prompt)
      .then(url => url && setStudioFrontUrl(url))
      .catch(e => console.error("Studio 1 failed", e))
      .finally(() => setLoadingStudio1(false));

    // Studio Angle
    setLoadingStudio2(true);
    const studio2Prompt = `
      Place this product on a pure white background.
      Perspective: Alternative angle or lifestyle context but on white.
      Showcase the texture: ${analysisRes.visualCharacteristics}.
      Professional product photography.
    `;
    generateMarketingAsset(data.imageBase64, data.mimeType, studio2Prompt)
      .then(url => url && setStudioAngleUrl(url))
      .catch(e => console.error("Studio 2 failed", e))
      .finally(() => setLoadingStudio2(false));
  };

  const handleRetry = (type: 'banner' | 'studio1' | 'studio2') => {
    if (!productData || !analysis || !productData.imageBase64) return;
    
    // Simple retry logic re-using the initial prompts for now
    if (type === 'banner') {
      setLoadingBanner(true);
      generateMarketingAsset(productData.imageBase64, productData.mimeType, `Create a ${analysis.recommendedBannerStyle} advertisement banner for ${productData.name}.`)
        .then(url => url && setBannerUrl(url))
        .finally(() => setLoadingBanner(false));
    }
    // ... similar for others
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Shopify Marketing AI</h1>
          </div>
          <div className="flex space-x-4">
             <button 
              onClick={() => setActiveTab('standard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'standard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
             >
               Quick Generate (Nano Banana)
             </button>
             <button 
              onClick={() => setActiveTab('pro')}
              disabled={!analysis}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-1 ${activeTab === 'pro' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-gray-900'} ${!analysis ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               Pro Studio <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full border border-purple-200">PRO</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 xl:col-span-3">
             <InputForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
             
             {/* Analysis Summary (if available) */}
             {analysis && (
               <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                 <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                   <Layers className="w-4 h-4 text-blue-500" />
                   AI Analysis
                 </h3>
                 <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Visuals</p>
                      <p className="text-gray-700 mt-1">{analysis.visualCharacteristics}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Palette</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-700">{analysis.colorPalette}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Strategy</p>
                      <p className="text-gray-700 mt-1 capitalize">{analysis.recommendedBannerStyle} Style</p>
                    </div>
                 </div>
               </div>
             )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8 xl:col-span-9">
            {activeTab === 'standard' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Generated Assets</h2>
                  {!productData && <span className="text-sm text-gray-400">Upload a product to begin</span>}
                </div>

                {/* Banner Section */}
                <AssetResult 
                  title="Marketing Banner"
                  description="Optimized for conversion with AI-generated composition."
                  imageUrl={bannerUrl}
                  isLoading={loadingBanner}
                  onRetry={() => handleRetry('banner')}
                  className="min-h-[400px]"
                />

                {/* Studio Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AssetResult 
                    title="Studio Shot (Front)"
                    description="Clean white background for product listings."
                    imageUrl={studioFrontUrl}
                    isLoading={loadingStudio1}
                    onRetry={() => handleRetry('studio1')}
                  />
                  <AssetResult 
                    title="Studio Shot (Creative)"
                    description="Alternative angle or highlighted feature."
                    imageUrl={studioAngleUrl}
                    isLoading={loadingStudio2}
                    onRetry={() => handleRetry('studio2')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <ProStudio 
                  productName={productData?.name || ''} 
                  productDesc={productData?.description || ''} 
                  visualAnalysis={analysis?.visualCharacteristics || ''}
                />
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;