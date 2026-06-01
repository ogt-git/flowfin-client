import { useState } from 'react';
import type { CodefModalInputUx } from '../../../constants/codefErrors';

interface Props {
  ux: CodefModalInputUx;
  onClose: () => void;
  onRetry: (values: { cardNumber: string; cardPassword: string }) => void;
}

function formatCardNumber(raw: string): string {
  return raw.replace(/(\d{4})(?=\d)/g, '$1-');
}

export function CodefErrorModal({ ux, onClose, onRetry }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardPassword, setCardPassword] = useState('');

  const passwordMaxLength = ux.fields.find((f) => f.key === 'cardPassword')?.maxLength ?? 4;
  const isValid = cardNumber.length === 16 && cardPassword.length === passwordMaxLength;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{ux.title}</h3>
        <p className="mb-4 text-sm text-gray-600">{ux.message}</p>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">카드번호 (16자리)</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatCardNumber(cardNumber)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
              setCardNumber(digits);
            }}
            placeholder="0000-0000-0000-0000"
            maxLength={19}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0A3D5C]"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium">
            카드 비밀번호 ({passwordMaxLength}자리)
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={cardPassword}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, passwordMaxLength);
              setCardPassword(digits);
            }}
            placeholder={`비밀번호 ${passwordMaxLength}자리`}
            maxLength={passwordMaxLength}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0A3D5C]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onRetry({ cardNumber, cardPassword })}
            disabled={!isValid}
            className="flex-1 rounded-md bg-[#0A3D5C] py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            확인
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
