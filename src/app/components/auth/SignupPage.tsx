import { useState } from 'react';
import { motion } from 'motion/react';
import { signup } from '../../../api/auth';

interface FormState {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

function validateName(name: string): string | undefined {
  if (!name) return '이름을 입력해주세요.';
  if (!/^[가-힣a-zA-Z]{2,10}$/.test(name)) return '이름은 한글 또는 영문만 2~10자로 입력해주세요.';
}

function validateEmail(email: string): string | undefined {
  if (!email) return '이메일을 입력해주세요.';
  if (email.length > 50) return '이메일은 50자 이하로 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식으로 입력해주세요. (예: example@email.com)';
}

function validatePassword(password: string, email: string): string | undefined {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8 || password.length > 20) return '비밀번호는 8~20자로 입력해주세요.';
  if (!/[A-Za-z]/.test(password)) return '영문자를 포함해야 합니다.';
  if (!/\d/.test(password)) return '숫자를 포함해야 합니다.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return '특수문자를 포함해야 합니다.';

  const emailPrefix = email.split('@')[0].toLowerCase();
  if (emailPrefix.length >= 4 && password.toLowerCase().includes(emailPrefix)) {
    return '비밀번호에 이메일 아이디를 포함할 수 없습니다.';
  }

  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return '동일한 문자를 3회 이상 연속 사용할 수 없습니다.';
    }
  }
}

function validatePasswordConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return '비밀번호 확인을 입력해주세요.';
  if (password !== confirm) return '비밀번호가 일치하지 않습니다.';
}

export default function SignupPage({
  onNavigateToLogin,
  onSignupSuccess,
}: {
  onNavigateToLogin: () => void;
  onSignupSuccess: (email: string, password: string) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', passwordConfirm: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false, email: false, password: false, passwordConfirm: false,
  });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (field: keyof FormState, value: string): string | undefined => {
    switch (field) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'password': return validatePassword(value, form.email);
      case 'passwordConfirm': return validatePasswordConfirm(form.password, value);
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (touched[field]) {
      setErrors(e => ({ ...e, [field]: validate(field, value) }));
    }
    if (field === 'password' && touched.passwordConfirm) {
      setErrors(e => ({ ...e, passwordConfirm: validatePasswordConfirm(value, form.passwordConfirm) }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validate(field, form[field]) }));
  };

  const handleSubmit = async () => {
    setTouched({ name: true, email: true, password: true, passwordConfirm: true });

    const newErrors: FieldErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password, form.email),
      passwordConfirm: validatePasswordConfirm(form.password, form.passwordConfirm),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setSubmitError('');
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      await onSignupSuccess(form.email, form.password);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? '회원가입에 실패했습니다.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full rounded-xl border bg-input-background px-4 py-3 outline-none transition-colors focus:border-primary ${
      touched[field] && errors[field] ? 'border-destructive' : 'border-border'
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-xl"
      >
        <h2 className="mb-1 text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
          💰 Flowfin
        </h2>
        <p className="mb-8 text-muted-foreground">회원가입</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="홍길동"
              maxLength={10}
              className={inputClass('name')}
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="example@email.com"
              maxLength={50}
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
              placeholder="영문+숫자+특수문자 8~20자"
              maxLength={20}
              className={inputClass('password')}
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm">비밀번호 확인</label>
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={e => handleChange('passwordConfirm', e.target.value)}
              onBlur={() => handleBlur('passwordConfirm')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="비밀번호를 다시 입력해주세요"
              maxLength={20}
              className={inputClass('passwordConfirm')}
            />
            {touched.passwordConfirm && errors.passwordConfirm && (
              <p className="mt-1 text-xs text-destructive">{errors.passwordConfirm}</p>
            )}
            {touched.passwordConfirm && !errors.passwordConfirm && form.passwordConfirm && (
              <p className="mt-1 text-xs text-emerald-600">비밀번호가 일치합니다.</p>
            )}
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <button onClick={onNavigateToLogin} className="text-primary hover:underline">
              로그인
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
