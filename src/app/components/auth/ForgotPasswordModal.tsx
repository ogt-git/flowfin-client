import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset, confirmPasswordReset } from '../../../api/auth';

type Step = 'email' | 'otp' | 'done';

interface Props {
  onClose: () => void;
  initialEmail?: string;
}

function validateEmail(email: string) {
  if (!email) return '이메일을 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식으로 입력해주세요.';
}

function validatePassword(pw: string) {
  if (!pw) return '새 비밀번호를 입력해주세요.';
  if (pw.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
}

export default function ForgotPasswordModal({ onClose, initialEmail = '' }: Props) {
  const [step, setStep] = useState<Step>('email');

  // Step 1
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Step 2
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError2, setConfirmError2] = useState('');
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startOtpTimer = () => {
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    setOtpTimeLeft(300);
    otpTimerRef.current = setInterval(() => {
      setOtpTimeLeft(prev => {
        if (prev <= 1) { clearInterval(otpTimerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (otpTimerRef.current) clearInterval(otpTimerRef.current); }, []);

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
    const err = validateEmail(email);
    setEmailError(err ?? '');
    if (err) return;

    setSendLoading(true);
    setSendError('');
    try {
      await requestPasswordReset(email);
      setStep('otp');
      startCooldown();
      startOtpTimer();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (e?.response?.status === 404) {
        setSendError('등록되지 않은 이메일입니다.');
      } else if (e?.response?.status === 429) {
        setSendError('잠시 후 다시 시도해주세요. (15초 제한)');
      } else {
        setSendError(msg ?? '인증코드 발송에 실패했습니다.');
      }
    } finally {
      setSendLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSendError('');
    setSendLoading(true);
    try {
      await requestPasswordReset(email);
      startCooldown();
      startOtpTimer();
    } catch (e: any) {
      if (e?.response?.status === 429) {
        setSendError('잠시 후 다시 시도해주세요. (15초 제한)');
      } else {
        setSendError('재발송에 실패했습니다.');
      }
    } finally {
      setSendLoading(false);
    }
  };

  const handleConfirm = async () => {
    let valid = true;

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setOtpError('6자리 숫자 인증코드를 입력해주세요.');
      valid = false;
    } else {
      setOtpError('');
    }

    const pwErr = validatePassword(newPassword);
    setPasswordError(pwErr ?? '');
    if (pwErr) valid = false;

    if (newPassword !== confirmPassword) {
      setConfirmError('비밀번호가 일치하지 않습니다.');
      valid = false;
    } else {
      setConfirmError('');
    }

    if (!valid) return;

    setConfirmLoading(true);
    setConfirmError2('');
    try {
      await confirmPasswordReset(email, otp, newPassword);
      setStep('done');
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400) {
        setConfirmError2('인증코드가 올바르지 않습니다.');
      } else if (status === 410 || e?.response?.data?.message?.includes('만료')) {
        setConfirmError2('인증코드가 만료되었습니다. 다시 요청해주세요.');
      } else {
        setConfirmError2(e?.response?.data?.message ?? '비밀번호 변경에 실패했습니다.');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const inputBase =
    'w-full rounded-xl border bg-input-background px-4 py-3 outline-none transition-colors focus:border-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>

          {step === 'email' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">비밀번호 찾기</h3>
                  <p className="text-xs text-muted-foreground">가입한 이메일로 인증코드를 보내드립니다.</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  placeholder="example@email.com"
                  className={`${inputBase} ${emailError ? 'border-destructive' : 'border-border'}`}
                />
                {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
              </div>

              {sendError && <p className="text-sm text-destructive">{sendError}</p>}

              <button
                onClick={handleSendOtp}
                disabled={sendLoading}
                className="w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {sendLoading ? '발송 중...' : '인증코드 발송'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">인증코드 입력</h3>
                  <p className="text-xs text-muted-foreground">{email}으로 발송된 6자리 코드</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm">인증코드</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  placeholder="000000"
                  className={`${inputBase} text-center tracking-[0.4em] ${otpError ? 'border-destructive' : 'border-border'}`}
                />
                {otpError && <p className="mt-1 text-xs text-destructive">{otpError}</p>}
                <div className="mt-1 flex items-center justify-between">
                  {otpTimeLeft > 0 ? (
                    <p className="text-xs text-destructive">
                      남은 시간 <span className="font-medium">
                        {String(Math.floor(otpTimeLeft / 60)).padStart(2, '0')}:{String(otpTimeLeft % 60).padStart(2, '0')}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-destructive">인증 시간이 만료됐습니다.</p>
                  )}
                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || sendLoading}
                    className="text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    재발송
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm">새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                  placeholder="8자 이상"
                  className={`${inputBase} ${passwordError ? 'border-destructive' : 'border-border'}`}
                />
                {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm">비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setConfirmError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  placeholder="비밀번호를 다시 입력해주세요."
                  className={`${inputBase} ${confirmError ? 'border-destructive' : 'border-border'}`}
                />
                {confirmError && <p className="mt-1 text-xs text-destructive">{confirmError}</p>}
              </div>

              {sendError && <p className="text-sm text-destructive">{sendError}</p>}
              {confirmError2 && <p className="text-sm text-destructive">{confirmError2}</p>}

              <button
                onClick={handleConfirm}
                disabled={confirmLoading}
                className="w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {confirmLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">비밀번호 변경 완료</h3>
                <p className="mt-1 text-sm text-muted-foreground">새 비밀번호로 로그인해주세요.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90"
              >
                로그인하러 가기
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
