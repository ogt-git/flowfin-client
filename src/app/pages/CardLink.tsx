import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, CreditCard, ChevronRight, FolderOpen } from 'lucide-react';
import { connectAccount } from '../../api/codef';
import { CardVisual } from '../components/CardVisual';
import { CARD_ORGANIZATIONS } from '../../types/card';
import type { LoginType } from '../../types/card';
import type { CodefConnectRequest } from '../../types/codef';

interface CardLinkForm {
  organization: string;
  loginType: LoginType;
  id: string;
  password: string;
}

const EMPTY_FORM: CardLinkForm = {
  organization: '',
  loginType: '1',
  id: '',
  password: '',
};

export default function CardLink() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CardLinkForm>(EMPTY_FORM);
  const [derFile, setDerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const folderRef = useRef<HTMLInputElement>(null);

  const selectedCard = CARD_ORGANIZATIONS.find((c) => c.code === form.organization);

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const der = files.find((f) => f.name.toLowerCase().endsWith('.der')) ?? null;
    const key = files.find((f) => f.name.toLowerCase().endsWith('.key')) ?? null;
    setDerFile(der);
    setKeyFile(key);
    if (!der || !key) toast.error('선택한 폴더에서 공인인증서 파일(.der, .key)을 찾을 수 없습니다.');
  }

  function handleOrg(code: string) {
    setForm((prev) => ({ ...prev, organization: code }));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === 'loginType') {
      setForm((prev) => ({ ...prev, loginType: value as LoginType, id: '', password: '' }));
      setDerFile(null);
      setKeyFile(null);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }) as CardLinkForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

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
    }

    setLoading(true);
    try {
      const payload: CodefConnectRequest = {
        organization: form.organization,
        businessType: 'CD',
        loginType: form.loginType,
        id: form.id,
        password: form.password,
        ...(form.loginType === '0' && { derFile: derFile!, keyFile: keyFile! }),
      };
      await connectAccount(payload);
      toast.success('카드 연동이 완료되었습니다. 잠시 후 지출내역 페이지로 이동합니다.');
      setTimeout(() => navigate('/expenses'), 12000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
      const serverMsg = axiosErr.response?.data?.message;
      const status = axiosErr.response?.status;
      if (status === 409) {
        toast.error(serverMsg ?? '이미 연동된 카드사입니다. 마이페이지에서 해제 후 다시 시도해주세요.');
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('카드 연동에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-[#0A3D5C]" />
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
                                      ? 'border-[#0A3D5C] bg-[#0A3D5C] text-white shadow-md'
                                      : 'border-border bg-white text-foreground hover:border-[#0A3D5C]/40 hover:bg-secondary'
                              }`}
                          >
                            {org.name}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* 카드 비주얼 */}
                  <div className="flex justify-center pt-2">
                    <CardVisual
                        organizationName={selectedCard?.name ?? '카드사 미선택'}
                        organizationColor={selectedCard?.color ?? '#CBD5E1'}
                    />
                  </div>
                </div>

                {/* 우측 — 입력 폼 */}
                <div className="space-y-6">
                  {/* loginType */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-foreground">
                      로그인 방식
                    </label>
                    <div className="flex gap-4">
                      {(
                          [
                            { value: '0', label: '공인인증서' },
                            { value: '1', label: '아이디/비밀번호' },
                          ] as { value: LoginType; label: string }[]
                      ).map((opt) => (
                          <label
                              key={opt.value}
                              className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                                type="radio"
                                name="loginType"
                                value={opt.value}
                                checked={form.loginType === opt.value}
                                onChange={handleChange}
                                className="accent-[#0A3D5C]"
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
                        <label className="mb-2 block text-sm font-medium text-foreground">인증서 비밀번호</label>
                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="공인인증서 비밀번호"
                          className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
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
                          className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
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
                          className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                        />
                      </div>
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
                        type="submit"
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A3D5C] py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0A3D5C]/90 disabled:opacity-60"
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
