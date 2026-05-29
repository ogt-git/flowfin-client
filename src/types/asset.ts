export interface StockItem {
  itemName: string;
  itemCode: string;
  quantity: number;
  purchaseAmount: number;
  valuationAmt: number;
  valuationPl: number;
  earningsRate: number;
}

export interface StockAccount {
  brokerCode: string;
  accountNo: string;
  totalAsset: number;
  depositReceived: number;
  items: StockItem[];
}

export interface AssetSummaryData {
  totalStockAsset: number;
  depositReceived: number;
  liquidManualAsset: number;
  totalManualAsset: number;
  investableAmount: number;
  fixedMonthlyAvg: number;
  emergencyFund: number;
}

export interface ManualAssetItem {
  id: number;
  assetType: string;
  itemName: string;
  purchaseAmount: number;
  valuationAmt: number;
  purchaseDate: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}
