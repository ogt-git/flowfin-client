import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, CreditCard, ChevronRight } from 'lucide-react';
import { connectAccount } from '../../api/codef';
import { CardVisual } from '../components/CardVisual';
import { Sidebar } from '../components/Sidebar';
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
  const [loading, setLoading] = useState(false);

  const selectedCard = CARD_ORGANIZATIONS.find((c) => c.code === form.organization);

  function handleOrg(code: string) {
    setForm((prev) => ({ ...prev, organization: code }));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }) as CardLinkForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.organization) {
      toast.error('카드사를 선택해주세요.');
      return;
    }
    if (!form.id || !form.password) {
      toast.error('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const payload: CodefConnectRequest = {
        organization: form.organization,
        businessType: 'CD',
        loginType: form.loginType,
        id: form.id,
        password: form.password,
      };
      await connectAccount(payload);
      toast.success('카드 연동이 완료되었습니다.');
      navigate('/dashboard');
    } catch {
      toast.error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="ml-64 flex-1 bg-background">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-8 py-5">
              <CreditCard className="h-5 w-5 text-[#0A3D5C]" />
              <h1 className="text-xl font-medium">카드 연동</h1>
            </div>
          </header>

          <div className="p-8">
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

                  {/* id */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      아이디
                    </label>
                    <input
                        type="text"
                        name="id"
                        value={form.id}
                        onChange={handleChange}
                        placeholder="금융기관 로그인 아이디"
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                    />
                  </div>

                  {/* password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      비밀번호
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="금융기관 로그인 비밀번호"
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
                    />
                  </div>

                  {/* 안내 박스 */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    비밀번호는 HTTPS 암호화 채널로 전송되며 서버에 저장되지 않습니다.
                  </div>

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
        </main>
      </div>
  );
}
