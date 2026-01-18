export interface ProductData {
  name: string;
  description: string;
  imageBase64: string | null;
  mimeType: string;
}

export interface AnalysisResult {
  visualCharacteristics: string;
  colorPalette: string;
  marketingHooks: string[];
  recommendedBannerStyle: 'ecommerce' | 'lifestyle' | 'minimalist';
}

export interface GeneratedAsset {
  id: string;
  type: 'banner' | 'studio_front' | 'studio_angle' | 'pro_concept';
  imageUrl: string;
  description: string;
  timestamp: number;
}

export enum AspectRatio {
  SQUARE_1_1 = '1:1',
  PORTRAIT_3_4 = '3:4',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9',
  LANDSCAPE_4_3 = '4:3',
  LANDSCAPE_21_9 = '21:9',
  STANDARD_3_2 = '3:2',
  STANDARD_2_3 = '2:3'
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export enum BannerStyle {
  ECOMMERCE = 'E-commerce',
  LIFESTYLE = 'Social Media',
  MINIMALIST = 'Minimalist'
}