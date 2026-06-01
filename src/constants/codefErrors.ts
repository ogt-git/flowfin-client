export interface CodefErrorField {
  key: 'cardNumber' | 'cardPassword';
  label: string;
  type: 'text' | 'password';
  maxLength: number;
  inputMode: 'numeric';
}

export interface CodefModalInputUx {
  type: 'MODAL_INPUT';
  title: string;
  message: string;
  fields: CodefErrorField[];
}

interface CodefToastUx {
  type: 'TOAST_ERROR' | 'TOAST_INFO';
  message: string;
}

export type CodefErrorUx = CodefModalInputUx | CodefToastUx;

export const CODEF_ERROR_UX: Record<string, CodefErrorUx> = {
  'CF-12108': {
    type: 'MODAL_INPUT',
    title: 'KB카드 소지 확인',
    message: 'KB카드 이용을 위해 카드번호와 카드 비밀번호(앞 2자리) 확인이 필요합니다.',
    fields: [
      { key: 'cardNumber',   label: '카드번호 (16자리)',        type: 'text',     maxLength: 16, inputMode: 'numeric' },
      { key: 'cardPassword', label: '카드 비밀번호 (앞 2자리)', type: 'password', maxLength: 2,  inputMode: 'numeric' },
    ],
  },
  'CF-12401': {
    type: 'MODAL_INPUT',
    title: '현대카드 추가 인증 필요',
    message: '현대카드 연동을 위해 카드번호와 카드 비밀번호 4자리 입력이 필요합니다.',
    fields: [
      { key: 'cardNumber',   label: '카드번호 (16자리)',      type: 'text',     maxLength: 16, inputMode: 'numeric' },
      { key: 'cardPassword', label: '카드 비밀번호 (4자리)', type: 'password', maxLength: 4,  inputMode: 'numeric' },
    ],
  },
};

export function resolveCodefError(errorCode: string): CodefErrorUx {
  return (
    CODEF_ERROR_UX[errorCode] ?? {
      type: 'TOAST_ERROR',
      message: '일시적인 오류가 발생했습니다. 문제가 지속되면 연동을 재설정해 주세요.',
    }
  );
}
