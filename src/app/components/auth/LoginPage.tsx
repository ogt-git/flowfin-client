import { useState } from 'react';
import { motion } from 'motion/react';
import { login } from '../../../api/auth';

interface FieldErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email) return '이메일을 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식으로 입력해주세요.';
}

function validatePassword(password: string): string | undefined {
  if (!password) return '비밀번호를 입력해주세요.';
}

export default function LoginPage({
  onNavigateToSignup,
  onLoginSuccess,
}: {
  onNavigateToSignup: () => void;
  onLoginSuccess: (data: { accessToken: string; name: string; userId: number; email: string; riskType: string | null }) => void;
}) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: 'email' | 'password', value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (touched[field]) {
      setErrors(e => ({
        ...e,
        [field]: field === 'email' ? validateEmail(value) : validatePassword(value),
      }));
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({
      ...e,
      [field]: field === 'email' ? validateEmail(form.email) : validatePassword(form.password),
    }));
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    const newErrors: FieldErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setSubmitError('');
    try {
      const data = await login({ email: form.email, password: form.password });
      onLoginSuccess(data);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 400) {
        setSubmitError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setSubmitError(e?.response?.data?.message ?? '로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: 'email' | 'password') =>
    `w-full rounded-xl border bg-input-background px-4 py-3 outline-none transition-colors focus:border-primary ${
      touched[field] && errors[field] ? 'border-destructive' : 'border-border'
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-xl"
      >
        <h2 className="mb-1 text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
          💰 Flowfin
        </h2>
        <p className="mb-8 text-muted-foreground">스마트 자산관리 서비스</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="example@email.com"
              className={inputClass('email')}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className={inputClass('password')}
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <button onClick={onNavigateToSignup} className="text-primary hover:underline">
              회원가입
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
