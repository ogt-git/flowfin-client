// 계정 연결 Request — 백엔드 CodefConnectRequest DTO 필드명과 1:1 일치
// businessType: CD=카드, BK=은행, ST=증권
// loginType: 0=인증서, 1=아이디/비밀번호 (CODEF 표준)
export interface CodefConnectRequest {
  organization: string;
  businessType: 'CD' | 'BK' | 'ST';
  loginType: '0' | '1';
  id?: string;
  password: string;
  birthDate?: string;
  accountNumber?: string;
  accountPassword?: string;
  derFile?: File;
  keyFile?: File;
}

// 카드 청구내역 조회 Request — 백엔드 CodefCardRequest DTO
export interface CodefCardRequest {
  connectedId: string;
  organization: string;
  startDate: string; // "yyyyMMdd"
  endDate: string;   // "yyyyMMdd"
}

// 동기화 결과 — 백엔드 CodefSyncResultDto
export interface CodefSyncResult {
  savedCount: number;
  skippedCount: number;
  failedAccounts: string[];
  syncedAt: string;
}

// 공통 API Response 래퍼 — 백엔드 ApiResponse<T>
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface CodefConnection {
  id: number;
  organizationCode: string;
  accountType: 'STOCK' | 'CARD';
  accountNumber: string;
  isActive: boolean;
  createdAt: string;
}
