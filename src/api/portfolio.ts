import http from './http';
import type { ApiResponse } from '../types/codef';
import type { Portfolio, PortfolioStatusResponse, PortfolioResult, RecommendedAsset } from '../types/portfolio';

const api = http;

export interface RecommendResult {
  accepted: boolean;
  result?: PortfolioResult;
  needAssetLink?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAsset(raw: any): RecommendedAsset {
  return {
    assetClass:  raw.asset_class   ?? raw.assetClass,
    subCategory: raw.sub_category  ?? raw.subCategory,
    ratio:       raw.ratio,
    amount:      raw.amount,
    reason:      raw.reason,
    description: raw.description,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResult(raw: any): PortfolioResult {
  return {
    investableAmount: raw.investable_amount ?? raw.investableAmount,
    assetLinked:      raw.assetLinked,
    needAssetLink:    raw.needAssetLink,
    riskType:         raw.risk_type   ?? raw.riskType,
    summary:          raw.summary,
    aiDiagnosis:      raw.ai_diagnosis ?? raw.aiDiagnosis,
    allocation:       (raw.allocation ?? []).map(normalizeAsset),
    disclaimer:       raw.disclaimer,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePortfolio(raw: any): Portfolio {
  const assets = (raw.allocation ?? raw.recommended_assets ?? raw.recommendedAssets ?? []).map(normalizeAsset);
  return {
    id:                raw.id,
    portfolioId:       raw.portfolio_id        ?? raw.portfolioId,
    investableAmount:  raw.investable_amount   ?? raw.investableAmount,
    riskType:          raw.risk_type           ?? raw.riskType,
    portfolioRiskType: raw.portfolio_risk_type ?? raw.portfolioRiskType,
    recommendedAssets: assets,
    allocation:        assets,
    summary:           raw.summary,
    aiDiagnosis:       raw.ai_diagnosis        ?? raw.aiDiagnosis,
    status:            raw.status,
    createdAt:         raw.created_at          ?? raw.createdAt,
  };
}

export async function fetchPortfolioStatus(): Promise<PortfolioStatusResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await api.get<ApiResponse<any>>('/api/portfolio');
  const raw = res.data.data;
  return {
    portfolioId:       raw.portfolioId,
    status:            raw.status,
    canRecommend:      raw.canRecommend,
    pendingExists:     raw.pendingExists,
    lastRecommendedAt: raw.lastRecommendedAt,
    result:            raw.result ? normalizeResult(raw.result) : undefined,
  };
}

export async function fetchPortfolioHistory(): Promise<Portfolio[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await api.get<ApiResponse<any[]>>('/api/portfolio/history');
  return (res.data.data ?? []).map(normalizePortfolio);
}

export async function recommendPortfolio(): Promise<RecommendResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await api.post<any>('/api/portfolio/recommend');
  if (res.status === 202) {
    return { accepted: true };
  }
  const raw = res.data?.data ?? res.data;
  if (!raw) return { accepted: false };
  const result = normalizeResult(raw);
  if (result.needAssetLink) {
    return { accepted: false, needAssetLink: true };
  }
  return { accepted: false, result };
}
