export interface CardOrganization {
  code: string;
  name: string;
  color: string;
}

export interface StockOrganization {
  code: string;
  name: string;
}

export type LoginType = '0' | '1';
export type BusinessType = 'CD' | 'BK' | 'ST';

export const CARD_ORGANIZATIONS: CardOrganization[] = [
  { code: '0301', name: 'KB카드',   color: '#FFB800' },
  { code: '0302', name: '현대카드', color: '#1A1A1A' },
  { code: '0303', name: '삼성카드', color: '#1428A0' },
  { code: '0304', name: 'NH카드',   color: '#009B3A' },
  { code: '0305', name: 'BC카드',   color: '#E60012' },
  { code: '0306', name: '신한카드', color: '#0046FF' },
  { code: '0307', name: '씨티카드', color: '#003087' },
  { code: '0309', name: '우리카드', color: '#0070BC' },
  { code: '0311', name: '롯데카드', color: '#E30613' },
  { code: '0313', name: '하나카드', color: '#009B77' },
  { code: '0315', name: '전북카드', color: '#005BAC' },
  { code: '0316', name: '광주카드', color: '#0054A4' },
  { code: '0320', name: '수협카드', color: '#005BAA' },
  { code: '0321', name: '제주카드', color: '#00A859' },
];

export const STOCK_ORGANIZATIONS: StockOrganization[] = [
  { code: '0209', name: '유안타증권' },
  { code: '0218', name: 'KB증권' },
  { code: '0225', name: 'IBK투자증권' },
  { code: '0227', name: '다올투자증권' },
  { code: '0238', name: '미래에셋증권' },
  { code: '0240', name: '삼성증권' },
  { code: '0243', name: '한국투자증권' },
  { code: '0247', name: 'NH투자증권' },
  { code: '0261', name: '교보증권' },
  { code: '0262', name: '하이투자증권' },
  { code: '0264', name: '키움증권' },
  { code: '0265', name: 'LS증권' },
  { code: '0266', name: 'SK증권' },
  { code: '0267', name: '대신증권' },
  { code: '0269', name: '한화투자증권' },
  { code: '0270', name: '하나금융투자' },
  { code: '0278', name: '신한금융투자' },
  { code: '0279', name: 'DB금융투자' },
  { code: '0280', name: '유진투자증권' },
  { code: '0287', name: '메리츠종합금융증권' },
  { code: '1247', name: 'NH투자증권 나무' },
  { code: '1267', name: '대신증권 크레온' },
];
