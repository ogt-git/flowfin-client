export interface RecommendedAsset {
  assetClass: string;
  ratio: number;
  amount: number;
  description?: string;
}

export interface Portfolio {
  id: number;
  investableAmount: number;
  riskType: string;
  recommendedAssets: RecommendedAsset[];
  createdAt: string;
}
