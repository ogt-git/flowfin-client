export type PortfolioStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface RecommendedAsset {
  assetClass: string;
  subCategory?: string;
  ratio: number;
  amount: number;
  reason?: string;
  description?: string;
}

// GET /api/portfolio 응답
export interface PortfolioStatusResponse {
  portfolioId?: number;
  status?: PortfolioStatus | null;
  canRecommend: boolean;
  pendingExists: boolean;
  lastRecommendedAt?: string;
  result?: PortfolioResult;
}

// COMPLETED 시 result 필드 / CACHE_HIT 즉시 반환값
export interface PortfolioResult {
  investableAmount: number;
  assetLinked: boolean;
  needAssetLink: boolean;
  riskType: string;
  summary?: string;
  aiDiagnosis?: string;
  allocation: RecommendedAsset[];
  disclaimer?: string;
}

// GET /api/portfolio/history 아이템
export interface Portfolio {
  id?: number;
  portfolioId?: number;
  investableAmount: number;
  riskType?: string;
  portfolioRiskType?: string;
  recommendedAssets?: RecommendedAsset[];
  allocation?: RecommendedAsset[];
  summary?: string;
  aiDiagnosis?: string;
  status?: PortfolioStatus | null;
  createdAt: string;
}
