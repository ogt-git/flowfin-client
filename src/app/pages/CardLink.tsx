import { useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, CreditCard, ChevronRight, FolderOpen } from 'lucide-react';
import { connectAccount } from '../../api/codef';
import { CardVisual } from '../components/CardVisual';
import { CodefErrorModal } from '../components/codef/CodefErrorModal';
import { resolveCodefError, type CodefModalInputUx } from '../../constants/codefErrors';
import { CARD_ORGANIZATIONS } from '../../types/card';
import type { LoginType } from '../../types/card';
import type { CodefConnectRequest } from '../../types/codef';

interface CardLinkForm {
  organization: string;
  loginType: LoginType;
  id: string;
  password: string;
  accountNumber: string;
  accountPassword: string;
}

const EMPTY_FORM: CardLinkForm = {
  organization: '',
  loginType: '1',
  id: '',
  password: '',
  accountNumber: '',
  accountPassword: '',
};

const HYUNDAI_CODE = '0302';

function formatCardNumber(raw: string): string {
  return raw.replace(/(\d{4})(?=\d)/g, '$1-');
}

export default function CardLink() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CardLinkForm>(EMPTY_FORM);
  const [derFile, setDerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<CodefModalInputUx | null>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [connectingMsg, setConnectingMsg] = useState('');

  const selectedCard = CARD_ORGANIZATIONS.find((c) => c.code === form.organization);
  const isHyundaiIdPw = form.organization === HYUNDAI_CODE && form.loginType === '1';
  const hyundaiFieldsValid =
    !isHyundaiIdPw || (form.accountNumber.length === 16 && form.accountPassword.length === 4);

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const der = files.find((f) => f.name.toLowerCase().endsWith('.der')) ?? null;
    const key = files.find((f) => f.name.toLowerCase().endsWith('.key')) ?? null;
    setDerFile(der);
    setKeyFile(key);
    if (!der || !key) toast.error('선택한 폴더에서 공인인증서 파일(.der, .key)을 찾을 수 없습니다.');
  }

  function handleOrg(code: string) {
    setForm((prev) => ({ ...prev, organization: code, accountNumber: '', accountPassword: '' }));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (name === 'loginType') {
      setForm((prev) => ({
        ...prev,
        loginType: value as LoginType,
        id: '',
        password: '',
        accountNumber: '',
        accountPassword: '',
      }));
      setDerFile(null);
      setKeyFile(null);
      return;
    }

    if (name === 'accountNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      setForm((prev) => ({ ...prev, accountNumber: digits }));
      return;
    }

    if (name === 'accountPassword') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      setForm((prev) => ({ ...prev, accountPassword: digits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }) as CardLinkForm);
  }

  function buildPayload(extra?: { cardNumber: string; cardPassword: string }): CodefConnectRequest {
    return {
      organization: form.organization,
      businessType: 'CD',
      loginType: form.loginType,
      id: form.id,
      password: form.password,
      accountNumber: extra?.cardNumber ?? (form.accountNumber || undefined),
      accountPassword: extra?.cardPassword ?? (form.accountPassword || undefined),
      ...(form.loginType === '0' && { derFile: derFile!, keyFile: keyFile! }),
    };
  }

  function handleCodefError(err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string; errorCode?: string }; status?: number } };
    const serverData = axiosErr.response?.data;
    const status = axiosErr.response?.status;
    const errorCode = serverData?.errorCode;

    if (errorCode) {
      const ux = resolveCodefError(errorCode);
      if (ux.type === 'MODAL_INPUT') {
        setErrorModal(ux as CodefModalInputUx);
        return;
      }
      toast.error(ux.message);
      return;
    }

    if (status === 409) {
      toast.error(serverData?.message ?? '이미 연동된 카드사입니다. 마이페이지에서 해제 후 다시 시도해주세요.');
    } else if (serverData?.message) {
      toast.error(serverData.message);
    } else {
      toast.error('카드 연동에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  async function handleSubmit() {
    if (!form.organization) {
      toast.error('카드사를 선택해주세요.');
      return;
    }
    if (form.loginType === '0') {
      if (!derFile) { toast.error('인증서 파일(.der)을 선택해주세요.'); return; }
      if (!keyFile) { toast.error('개인키 파일(.key)을 선택해주세요.'); return; }
      if (!form.password) { toast.error('인증서 비밀번호를 입력해주세요.'); return; }
    } else {
      if (!form.id || !form.password) {
        toast.error('아이디와 비밀번호를 입력해주세요.');
        return;
      }
      if (isHyundaiIdPw && !hyundaiFieldsValid) {
        toast.error('카드번호 16자리와 카드 비밀번호 4자리를 입력해주세요.');
        return;
      }
    }

    setLoading(true);
    setConnectingMsg('카드사에 연결하는 중...');
    try {
      await connectAccount(buildPayload());
      navigate('/expenses', { state: { justLinked: true } });
    } catch (err) {
      setLoading(false);
      setConnectingMsg('');
      handleCodefError(err);
    }
  }

  async function handleRetry(values: { cardNumber: string; cardPassword: string }) {
    setErrorModal(null);
    setLoading(true);
    setConnectingMsg('카드사에 연결하는 중...');
    try {
      await connectAccount(buildPayload(values));
      navigate('/expenses', { state: { justLinked: true } });
    } catch (err) {
      setLoading(false);
      setConnectingMsg('');
      handleCodefError(err);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          </div>
          <p className="mb-1 text-base font-semibold">{connectingMsg}</p>
          <p className="text-xs text-muted-foreground">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-medium">카드 연동</h2>
      </div>
      <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 좌측 — 카드사 선택 + 미리보기 */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-base font-medium text-foreground">카드사 선택</h3>
            <div className="grid grid-cols-2 gap-2">
              {CARD_ORGANIZATIONS.map((org) => (
                <button
                  key={org.code}
                  type="button"
                  onClick={() => handleOrg(org.code)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    form.organization === org.code
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-border bg-white text-foreground hover:border-primary/40 hover:bg-secondary'
                  }`}
                >
                  {org.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <CardVisual
              organizationName={selectedCard?.name ?? '카드사 미선택'}
              organizationColor={selectedCard?.color ?? '#CBD5E1'}
            />
          </div>
        </div>

        {/* 우측 — 입력 폼 */}
        <div className="space-y-6">
          {/* 로그인 방식 */}
          <div>
            <label className="mb-3 block text-sm font-medium text-foreground">로그인 방식</label>
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
                    checked={form.loginType === opt.value}
                    onChange={handleChange}
                    className="accent-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {form.loginType === '0' ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">공인인증서 폴더</label>
                <input
                  ref={folderRef}
                  type="file"
                  className="hidden"
                  multiple
                  {...{ webkitdirectory: '' }}
                  onChange={handleFolderSelect}
                />
                <button
                  onClick={() => folderRef.current?.click()}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    derFile && keyFile
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-input-background text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span>{derFile && keyFile ? '인증서 확인됨' : '인증서 폴더 선택'}</span>
                </button>
                {(derFile || keyFile) && (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className={derFile ? 'text-primary' : 'text-red-500'}>{derFile ? `✓ ${derFile.name}` : '✗ .der 파일 없음'}</p>
                    <p className={keyFile ? 'text-primary' : 'text-red-500'}>{keyFile ? `✓ ${keyFile.name}` : '✗ .key 파일 없음'}</p>
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
                <label className="mb-2 block text-sm font-medium text-foreground">인증서 비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="공인인증서 비밀번호"
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">아이디</label>
                <input
                  type="text"
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="금융기관 로그인 아이디"
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="금융기관 로그인 비밀번호"
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* 현대카드 추가 필드 */}
              {isHyundaiIdPw && (
                <>
                  <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                    현대카드 아이디 로그인에는 카드번호(16자리)와 카드 비밀번호 4자리가 추가로 필요합니다.
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">카드번호 (16자리)</label>
                    <input
                      type="text"
                      name="accountNumber"
                      inputMode="numeric"
                      value={formatCardNumber(form.accountNumber)}
                      onChange={handleChange}
                      placeholder="0000-0000-0000-0000"
                      maxLength={19}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">카드 비밀번호 (4자리)</label>
                    <input
                      type="password"
                      name="accountPassword"
                      inputMode="numeric"
                      value={form.accountPassword}
                      onChange={handleChange}
                      placeholder="카드 비밀번호 4자리"
                      maxLength={4}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </>
              )}
            </>
          )}


                  {/* 버튼 */}
                  <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 rounded-xl border border-border bg-white py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
                    >
                      {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                          <>
                            카드 연동하기
                            <ChevronRight className="h-4 w-4" />
                          </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
      </form>

    </div>
  );
}
