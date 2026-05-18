export interface AssetItem {
  id: number;
  accountId: number;
  productType: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  purchaseAmount: number;
  valuationAmt: number;
  valuationPl: number;
  earningsRate: number;
  updatedAt: string;
}

export interface AssetAccount {
  id: number;
  brokerCode: string;
  accountNo: string;
  totalAsset: number;
  depositReceived: number;
  updatedAt: string;
}

export interface AssetSummary {
  totalAsset: number;
  totalPurchaseAmount: number;
  totalValuationPl: number;
  totalEarningsRate: number;
  accounts: AssetAccount[];
  items: AssetItem[];
}
