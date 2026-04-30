import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, TrendingUp, ChevronRight } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { connectAccount } from '../../api/codef';
import { STOCK_ORGANIZATIONS } from '../../types/card';
import type { LoginType, BusinessType } from '../../types/card';
import type { CodefConnectRequest } from '../../types/codef';

type AssetTab = 'savings' | 'stock' | 'realestate' | 'other';

interface ApiLinkForm {
  organization: string;
  loginType: LoginType;
  id: string;
  password: string;
}

interface ManualAssetForm {
  assetName: string;
  purchasePrice: string;
  currentPrice: string;
  purchaseDate: string;
  memo: string;
}

const EMPTY_API_FORM: ApiLinkForm = {
  organization: '',
  loginType: '1',
  id: '',
  password: '',
};

const EMPTY_MANUAL_FORM: ManualAssetForm = {
  assetName: '',
  purchasePrice: '',
  currentPrice: '',
  purchaseDate: '',
  memo: '',
};

const TAB_CONFIG: { key: AssetTab; label: string; businessType?: BusinessType }[] = [
  { key: 'savings', label: '💰 예·적금', businessType: 'BK' },
  { key: 'stock',   label: '📈 주식·펀드', businessType: 'ST' },
  { key: 'realestate', label: '🏠 부동산' },
  { key: 'other',   label: '🚗 기타' },
];

export default function AssetLink() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AssetTab>('savings');
  const [apiForm, setApiForm] = useState<ApiLinkForm>(EMPTY_API_FORM);
  const [manualForm, setManualForm] = useState<ManualAssetForm>(EMPTY_MANUAL_FORM);
  const [loading, setLoading] = useState(false);

  const currentTab = TAB_CONFIG.find((t) => t.key === activeTab)!;
  const isApiTab = activeTab === 'savings' || activeTab === 'stock';

  function handleTabChange(tab: AssetTab) {
    setActiveTab(tab);
    setApiForm(EMPTY_API_FORM);
    setManualForm(EMPTY_MANUAL_FORM);
  }

  function handleApiChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setApiForm((prev) => ({ ...prev, [name]: value }) as ApiLinkForm);
  }

  function handleManualChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setManualForm((prev) => ({ ...prev, [name]: value }) as ManualAssetForm);
  }

  async function handleApiSubmit(e: FormEvent) {
    e.preventDefault();

    if (!apiForm.organization) {
      toast.error('기관을 선택해주세요.');
      return;
    }
    if (!apiForm.id || !apiForm.password) {
      toast.error('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const payload: CodefConnectRequest = {
        organization: apiForm.organization,
        businessType: currentTab.businessType!,
        loginType: apiForm.loginType,
        id: apiForm.id,
        password: apiForm.password,
      };
      await connectAccount(payload);
      toast.success('자산 연동이 완료되었습니다.');
      navigate('/dashboard');
    } catch {
      toast.error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: 직접 입력 자산 저장 API 연동 (별도 엔드포인트 추가 후 구현)
    toast.info('직접 입력 자산 저장 기능은 추후 연동 예정입니다.');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 bg-background">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-8 py-5">
            <TrendingUp className="h-5 w-5 text-[#0A3D5C]" />
            <h1 className="text-xl font-medium">자산 연동</h1>
          </div>
        </header>

        <div className="p-8">
          {/* 탭 */}
          <div className="mb-8 flex gap-1 rounded-xl border border-border bg-white p-1">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#0A3D5C] text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* API 연동 탭 (예적금 / 주식·펀드) */}
          {isApiTab && (
            <form onSubmit={handleApiSubmit} className="grid gap-8 lg:grid-cols-2">
              {/* 기관 선택 */}
              <div>
                <h3 className="mb-4 text-base font-medium">
                  {activeTab === 'savings' ? '은행 선택' : '증권사 선택'}
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                  {STOCK_ORGANIZATIONS.map((org) => (
                    <button
                      key={org.code}
                      type="button"
                      onClick={() => setApiForm((prev) => ({ ...prev, organization: org.code }))}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all text-left ${
                        apiForm.organization === org.code
                          ? 'border-[#0A3D5C] bg-[#0A3D5C] text-white shadow-md'
                          : 'border-border bg-white text-foreground hover:border-[#0A3D5C]/40 hover:bg-secondary'
                      }`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 입력 폼 */}
              <div className="space-y-6">
                {/* loginType */}
                <div>
                  <label className="mb-3 block text-sm font-medium">로그인 방식</label>
                  <div className="flex gap-4">
                    {(
                      [
                        { value: '0', label: '공인인증서' },
                        { value: '1', label: '아이디/비밀번호' },
                      ] as { value: LoginType; label: string }[]
                    ).map((opt) => (
                      <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="loginType"
                          value={opt.value}
                          checked={apiForm.loginType === opt.value}
                          onChange={handleApiChange}
                          className="accent-[#0A3D5C]"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* id */}
                <div>
                  <label className="mb-2 block text-sm font-medium">아이디</label>
                  <input
                    type="text"
                    name="id"
                    value={apiForm.id}
                    onChange={handleApiChange}
                    placeholder="금융기관 로그인 아이디"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>

                {/* password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">비밀번호</label>
                  <input
                    type="password"
                    name="password"
                    value={apiForm.password}
                    onChange={handleApiChange}
                    placeholder="금융기관 로그인 비밀번호"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  비밀번호는 HTTPS 암호화 채널로 전송되며 서버에 저장되지 않습니다.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 rounded-xl border border-border bg-white py-3 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A3D5C] py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0A3D5C]/90 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        자산 연동하기
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 직접 입력 탭 (부동산 / 기타) */}
          {!isApiTab && (
            <form onSubmit={handleManualSubmit} className="max-w-lg space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">자산명</label>
                <input
                  type="text"
                  name="assetName"
                  value={manualForm.assetName}
                  onChange={handleManualChange}
                  placeholder={activeTab === 'realestate' ? '예) 서울 강남구 아파트' : '예) 자동차, 골드바'}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">취득가액 (원)</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={manualForm.purchasePrice}
                    onChange={handleManualChange}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">현재가액 (원)</label>
                  <input
                    type="number"
                    name="currentPrice"
                    value={manualForm.currentPrice}
                    onChange={handleManualChange}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">취득일자</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={manualForm.purchaseDate}
                  onChange={handleManualChange}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">메모 (선택)</label>
                <textarea
                  name="memo"
                  value={manualForm.memo}
                  onChange={handleManualChange}
                  rows={3}
                  placeholder="추가 메모를 입력하세요"
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 rounded-xl border border-border bg-white py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A3D5C] py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0A3D5C]/90"
                >
                  저장하기
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
