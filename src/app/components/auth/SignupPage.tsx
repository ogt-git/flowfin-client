import { useState } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { signup, requestEmailVerify, confirmEmailVerify } from '../../../api/auth';
import { TermsModal } from '../common/TermsModal';
import { ServiceTermsPage } from '../../pages/terms/ServiceTermsPage';
import { PrivacyPolicyPage } from '../../pages/terms/PrivacyPolicyPage';
import { ThirdPartyConsentPage } from '../../pages/terms/ThirdPartyConsentPage';

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

type TermsKey = 'service' | 'privacy' | 'thirdParty';

interface TermsState {
  service: boolean;
  privacy: boolean;
  thirdParty: boolean;
}

const TERMS_META: Record<TermsKey, { label: string; title: string; Component: () => React.ReactElement }> = {
  service: { label: '서비스 이용약관 동의', title: '서비스 이용약관', Component: ServiceTermsPage },
  privacy: { label: '개인정보 수집 및 이용 동의', title: '개인정보 수집 및 이용 동의', Component: PrivacyPolicyPage },
  thirdParty: { label: '개인정보 제3자 제공 동의', title: '개인정보 제3자 제공 동의', Component: ThirdPartyConsentPage },
};

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

  // 이메일 인증
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const [terms, setTerms] = useState<TermsState>({ service: false, privacy: false, thirdParty: false });
  const [openModal, setOpenModal] = useState<TermsKey | null>(null);

  const allChecked = terms.service && terms.privacy && terms.thirdParty;

  const handleAllChange = () => {
    const next = !allChecked;
    setTerms({ service: next, privacy: next, thirdParty: next });
  };

  const handleTermChange = (key: TermsKey) => {
    setTerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = (field: keyof FormState, value: string): string | undefined => {
    switch (field) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'password': return validatePassword(value, form.email);
      case 'passwordConfirm': return validatePasswordConfirm(form.password, value);
    }
  };

  const startCooldown = () => {
    setCooldown(15);
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const err = validateEmail(form.email);
    setErrors(e => ({ ...e, email: err }));
    setTouched(t => ({ ...t, email: true }));
    if (err) return;

    setSendLoading(true);
    try {
      await requestEmailVerify(form.email);
      setOtpSent(true);
      setOtpError('');
      startCooldown();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) setErrors(ev => ({ ...ev, email: '이미 사용 중인 이메일입니다.' }));
      else if (status === 429) setErrors(ev => ({ ...ev, email: '잠시 후 다시 시도해주세요. (15초 제한)' }));
      else setErrors(ev => ({ ...ev, email: '인증코드 발송에 실패했습니다.' }));
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setOtpError('6자리 인증코드를 입력해주세요.'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const token = await confirmEmailVerify(form.email, otp);
      setVerificationToken(token);
      setEmailVerified(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (e?.response?.status === 400) setOtpError('인증코드가 올바르지 않습니다.');
      else setOtpError(msg ?? '인증에 실패했습니다.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'email') {
      setEmailVerified(false);
      setVerificationToken('');
      setOtpSent(false);
      setOtp('');
      setOtpError('');
    }
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
    if (!emailVerified) { setSubmitError('이메일 인증을 완료해주세요.'); return; }
    if (!allChecked) return;

    setLoading(true);
    setSubmitError('');
    try {
      await signup({ name: form.name, email: form.email, password: form.password, termsVersion: '1.0', verificationToken });
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

  const activeModal = openModal ? TERMS_META[openModal] : null;

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
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
            <div className="flex gap-2">
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="example@email.com"
                maxLength={50}
                disabled={emailVerified}
                className={`flex-1 rounded-xl border bg-input-background px-4 py-3 outline-none transition-colors focus:border-primary disabled:opacity-60 ${
                  touched.email && errors.email ? 'border-destructive' : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={emailVerified ? undefined : (otpSent && cooldown > 0 ? undefined : handleSendOtp)}
                disabled={emailVerified || sendLoading || (otpSent && cooldown > 0)}
                className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {sendLoading ? '발송 중...' : otpSent && cooldown > 0 ? `재발송 (${cooldown}s)` : otpSent ? '재발송' : '인증코드 발송'}
              </button>
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email}</p>
            )}
            {emailVerified && (
              <p className="mt-1 text-xs text-emerald-600">✓ 이메일 인증 완료</p>
            )}
            {otpSent && !emailVerified && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  placeholder="인증코드 6자리"
                  className={`flex-1 rounded-xl border bg-input-background px-4 py-3 text-center tracking-widest outline-none transition-colors focus:border-primary ${
                    otpError ? 'border-destructive' : 'border-border'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {otpLoading ? '확인 중...' : '확인'}
                </button>
              </div>
            )}
            {otpError && <p className="mt-1 text-xs text-destructive">{otpError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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

          {/* 약관 동의 영역 */}
          <div className="rounded-xl border border-border p-4">
            {/* 전체 동의 */}
            <div className="mb-3 border-b border-border pb-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleAllChange}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="font-semibold text-sm">전체 동의</span>
              </label>
            </div>

            {/* 개별 항목 */}
            <div className="flex flex-col gap-2">
              {(Object.keys(TERMS_META) as TermsKey[]).map(key => (
                <div key={key} className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={terms[key]}
                      onChange={() => handleTermChange(key)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <span className="text-sm">
                      <span className="text-destructive font-medium">[필수]</span>{' '}
                      {TERMS_META[key].label}
                    </span>
                  </label>
                  <button
                    onClick={() => setOpenModal(key)}
                    className="ml-2 shrink-0 text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    보기 &gt;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !allChecked}
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

      {activeModal && (
        <TermsModal title={activeModal.title} onClose={() => setOpenModal(null)}>
          <activeModal.Component />
        </TermsModal>
      )}
    </div>
  );
}
