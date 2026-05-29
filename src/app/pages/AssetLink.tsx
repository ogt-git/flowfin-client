import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, TrendingUp, ChevronRight, FolderOpen } from 'lucide-react';
import { connectAccount } from '../../api/codef';
import { createManualAsset } from '../../api/assets';
import { STOCK_ORGANIZATIONS } from '../../types/card';
import type { LoginType } from '../../types/card';
import type { CodefConnectRequest } from '../../types/codef';

type MainTab = 'stock' | 'manual';
type ManualSubTab = 'deposit' | 'savings' | 'realestate' | 'cash' | 'pension' | 'other';

interface ApiLinkForm {
  organization: string;
  loginType: LoginType;
  id: string;
  password: string;
  accountNumber: string;
  accountPassword: string;
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
  accountNumber: '',
  accountPassword: '',
};

const EMPTY_MANUAL_FORM: ManualAssetForm = {
  assetName: '',
  purchasePrice: '',
  currentPrice: '',
  purchaseDate: '',
  memo: '',
};

const MANUAL_SUB_TABS: { key: ManualSubTab; label: string; placeholder: string; assetType: string }[] = [
  { key: 'deposit',    label: '🏦 예금',    placeholder: '예) 국민은행 정기예금',   assetType: 'DEPOSIT'     },
  { key: 'savings',    label: '💰 적금',    placeholder: '예) KB 정기적금',        assetType: 'SAVINGS'     },
  { key: 'realestate', label: '🏠 부동산',  placeholder: '예) 서울 강남구 아파트', assetType: 'REAL_ESTATE' },
  { key: 'cash',       label: '💵 현금',    placeholder: '예) 달러, 엔화',         assetType: 'CASH'        },
  { key: 'pension',    label: '🧓 연금',    placeholder: '예) IRP, 연금저축펀드',  assetType: 'PENSION'     },
  { key: 'other',      label: '🚗 기타',    placeholder: '예) 자동차, 골드바',     assetType: 'ETC'         },
];

export default function AssetLink() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>('stock');
  const [manualSubTab, setManualSubTab] = useState<ManualSubTab>('savings');
  const [apiForm, setApiForm] = useState<ApiLinkForm>(EMPTY_API_FORM);
  const [manualForm, setManualForm] = useState<ManualAssetForm>(EMPTY_MANUAL_FORM);
  const [derFile, setDerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const folderRef = useRef<HTMLInputElement>(null);

  function handleMainTabChange(tab: MainTab) {
    setMainTab(tab);
    setApiForm(EMPTY_API_FORM);
    setDerFile(null);
    setKeyFile(null);
    setManualForm(EMPTY_MANUAL_FORM);
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const der = files.find((f) => f.name.toLowerCase().endsWith('.der')) ?? null;
    const key = files.find((f) => f.name.toLowerCase().endsWith('.key')) ?? null;
    setDerFile(der);
    setKeyFile(key);
    if (!der || !key) toast.error('선택한 폴더에서 공인인증서 파일(.der, .key)을 찾을 수 없습니다.');
  }

  function handleSubTabChange(sub: ManualSubTab) {
    setManualSubTab(sub);
    setManualForm(EMPTY_MANUAL_FORM);
  }

  function handleApiChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === 'loginType') {
      setApiForm((prev) => ({ ...prev, loginType: value as LoginType, id: '', password: '', accountNumber: '', accountPassword: '' }));
      setDerFile(null);
      setKeyFile(null);
      return;
    }
    setApiForm((prev) => ({ ...prev, [name]: value }) as ApiLinkForm);
  }

  function handleManualChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setManualForm((prev) => ({ ...prev, [name]: value }) as ManualAssetForm);
  }

  async function handleApiSubmit(e: FormEvent) {
    e.preventDefault();
    if (!apiForm.organization) { toast.error('기관을 선택해주세요.'); return; }
    if (apiForm.loginType === '0') {
      if (!derFile) { toast.error('인증서 파일(.der)을 선택해주세요.'); return; }
      if (!keyFile) { toast.error('개인키 파일(.key)을 선택해주세요.'); return; }
      if (!apiForm.password) { toast.error('인증서 비밀번호를 입력해주세요.'); return; }
    } else {
      if (!apiForm.id || !apiForm.password) { toast.error('아이디와 비밀번호를 입력해주세요.'); return; }
    }

    setLoading(true);
    try {
      const payload: CodefConnectRequest = {
        organization: apiForm.organization,
        businessType: 'ST',
        loginType: apiForm.loginType,
        id: apiForm.id,
        password: apiForm.password,
        accountNumber: apiForm.accountNumber,
        accountPassword: apiForm.accountPassword,
        ...(apiForm.loginType === '0' && { derFile: derFile!, keyFile: keyFile! }),
      };
      await connectAccount(payload);
      toast.success('자산 연동이 완료되었습니다. 데이터는 약 10초 후 자동으로 불러와집니다.');
      navigate('/stocks');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
      const serverMsg = axiosErr.response?.data?.message;
      const status = axiosErr.response?.status;
      if (status === 409) {
        toast.error(serverMsg ?? '이미 연동된 증권사입니다. 마이페이지에서 해제 후 다시 시도해주세요.');
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('자산 연동에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    if (!manualForm.assetName.trim()) { toast.error('자산명을 입력해주세요.'); return; }
    if (manualSubTab === 'cash') {
      if (!manualForm.currentPrice) { toast.error('현재가액을 입력해주세요.'); return; }
    } else {
      if (!manualForm.purchasePrice || !manualForm.currentPrice) {
        toast.error('취득가액과 현재가액을 입력해주세요.');
        return;
      }
    }

    const subTab = MANUAL_SUB_TABS.find((s) => s.key === manualSubTab)!;
    const currentPrice = Number(manualForm.currentPrice);
    setLoading(true);
    try {
      await createManualAsset({
        assetType: subTab.assetType,
        itemName: manualForm.assetName.trim(),
        purchaseAmount: manualSubTab === 'cash' ? currentPrice : Number(manualForm.purchasePrice),
        valuationAmt: currentPrice,
        ...(manualSubTab !== 'cash' && manualForm.purchaseDate && { purchaseDate: manualForm.purchaseDate }),
        ...(manualForm.memo.trim() && { memo: manualForm.memo.trim() }),
      });
      toast.success('자산이 등록되었습니다.');
      navigate('/stocks');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown; status?: number } };
      console.error('[manual asset error]', axiosErr.response?.status, axiosErr.response?.data);
      toast.error('자산 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-[#0A3D5C]" />
        <h2 className="text-xl font-medium">자산 연동</h2>
      </div>

      {/* 메인 탭 */}
      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-white p-1">
        {(['stock', 'manual'] as MainTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleMainTabChange(tab)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              mainTab === tab
                ? 'bg-[#0A3D5C] text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'stock' ? '📈 주식·펀드' : '📋 수동 자산'}
          </button>
        ))}
      </div>

      {/* 수동 자산 서브탭 */}
      {mainTab === 'manual' && (
        <div className="mb-8 flex gap-2 pl-1">
          {MANUAL_SUB_TABS.map((sub) => (
            <button
              key={sub.key}
              type="button"
              onClick={() => handleSubTabChange(sub.key)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                manualSubTab === sub.key
                  ? 'border-[#0A3D5C] bg-[#0A3D5C]/10 text-[#0A3D5C]'
                  : 'border-border bg-white text-muted-foreground hover:text-foreground'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* 주식·펀드 API 연동 폼 */}
      {mainTab === 'stock' && (
        <form onSubmit={handleApiSubmit} className="mt-4 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-base font-medium">증권사 선택</h3>
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

          <div className="space-y-6">
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

            {apiForm.loginType === '0' ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium">공인인증서 폴더</label>
                  <input
                    ref={folderRef}
                    type="file"
                    className="hidden"
                    multiple
                    {...{ webkitdirectory: '' }}
                    onChange={handleFolderSelect}
                  />
                  <button
                    type="button"
                    onClick={() => folderRef.current?.click()}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                      derFile && keyFile ? 'border-[#0A3D5C] bg-[#0A3D5C]/5 text-[#0A3D5C]' : 'border-border bg-input-background text-muted-foreground hover:border-[#0A3D5C]/40'
                    }`}
                  >
                    <FolderOpen className="h-4 w-4 shrink-0" />
                    <span>{derFile && keyFile ? '인증서 확인됨' : '인증서 폴더 선택'}</span>
                  </button>
                  {(derFile || keyFile) && (
                    <div className="mt-2 space-y-1 text-xs">
                      <p className={derFile ? 'text-[#0A3D5C]' : 'text-red-500'}>{derFile ? `✓ ${derFile.name}` : '✗ .der 파일 없음'}</p>
                      <p className={keyFile ? 'text-[#0A3D5C]' : 'text-red-500'}>{keyFile ? `✓ ${keyFile.name}` : '✗ .key 파일 없음'}</p>
                    </div>
                  )}
                  <div className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">인증서 위치 안내</p>
                    <p>Windows: <span className="font-mono">C:\Users\사용자명\AppData\LocalLow\NPKI</span></p>
                    <p>Windows (공용): <span className="font-mono">C:\NPKI</span></p>
                    <p>Mac: <span className="font-mono">~/Library/Preferences/NPKI</span></p>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">인증서 비밀번호</label>
                  <input
                    type="password"
                    name="password"
                    value={apiForm.password}
                    onChange={handleApiChange}
                    placeholder="공인인증서 비밀번호"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">증권 계좌번호</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={apiForm.accountNumber}
                    onChange={handleApiChange}
                    placeholder="계좌번호 입력 (숫자만)"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">계좌 비밀번호</label>
                  <input
                    type="password"
                    name="accountPassword"
                    value={apiForm.accountPassword}
                    onChange={handleApiChange}
                    placeholder="증권 계좌 비밀번호"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>
              </>
            ) : (
              <>
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
                <div>
                  <label className="mb-2 block text-sm font-medium">증권 계좌번호</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={apiForm.accountNumber}
                    onChange={handleApiChange}
                    placeholder="계좌번호 입력 (숫자만)"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">계좌 비밀번호</label>
                  <input
                    type="password"
                    name="accountPassword"
                    value={apiForm.accountPassword}
                    onChange={handleApiChange}
                    placeholder="증권 계좌 비밀번호"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                  />
                </div>
              </>
            )}


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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>자산 연동하기 <ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 수동 자산 입력 폼 */}
      {mainTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="max-w-lg space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">자산명</label>
            <input
              type="text"
              name="assetName"
              value={manualForm.assetName}
              onChange={handleManualChange}
              placeholder={MANUAL_SUB_TABS.find((s) => s.key === manualSubTab)!.placeholder}
              className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
            />
          </div>

          {manualSubTab === 'cash' ? (
            <div>
              <label className="mb-2 block text-sm font-medium">보유 금액 (원)</label>
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
          ) : (
            <>
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
            </>
          )}

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
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A3D5C] py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0A3D5C]/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>저장하기 <ChevronRight className="h-4 w-4" /></>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
