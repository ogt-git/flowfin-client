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

export interface CodefModalCooldownUx {
  type: 'MODAL_COOLDOWN';
  title: string;
  message: string;
  cooldownSeconds: number;
}

export interface CodefModalReconnectUx {
  type: 'MODAL_RECONNECT';
  title: string;
  message: string;
  actionLabel: string;
}

export interface CodefModalInfoUx {
  type: 'MODAL_INFO';
  title: string;
  message: string;
  actionLabel?: string;
  actionType?: 'EXTERNAL_LINK';
}

interface CodefToastUx {
  type: 'TOAST_ERROR' | 'TOAST_INFO';
  message: string;
}

export type CodefErrorUx =
  | CodefModalInputUx
  | CodefModalCooldownUx
  | CodefModalReconnectUx
  | CodefModalInfoUx
  | CodefToastUx;

export const CODEF_ERROR_UX: Record<string, CodefErrorUx> = {
  // 카드 추가 인증
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

  // 쿨다운 필요
  'CF-12201': { type: 'MODAL_COOLDOWN', title: '중복 로그인 감지',   message: '다른 기기에서 동시 로그인 중입니다. 잠시 후 다시 시도해 주세요.',                        cooldownSeconds: 300  },
  'CF-01006': { type: 'MODAL_COOLDOWN', title: '요청 제한',          message: '중복 로그인 방지로 요청이 제한되었습니다. 잠시 후 다시 시도해 주세요.',                    cooldownSeconds: 300  },
  'CF-12207': { type: 'MODAL_COOLDOWN', title: '반복 로그인 제한',   message: '반복 로그인으로 계정이 일시 제한되었습니다. 30분 후 다시 시도해 주세요.',                  cooldownSeconds: 1800 },
  'CF-12106': { type: 'MODAL_COOLDOWN', title: '일시 이용 제한',     message: '과도한 요청으로 이용이 제한되었습니다. 잠시 후 다시 시도해 주세요.',                       cooldownSeconds: 300  },

  // 재연동 필요
  'CF-12800': { type: 'MODAL_RECONNECT', title: '아이디 오류',                  message: '금융사 아이디가 올바르지 않습니다. 아이디를 확인하고 다시 연동해 주세요.',                                            actionLabel: '재연동하기' },
  'CF-12801': { type: 'MODAL_RECONNECT', title: '비밀번호 오류',                message: '금융사 비밀번호가 올바르지 않습니다. 비밀번호를 확인하고 다시 연동해 주세요.',                                          actionLabel: '재연동하기' },
  'CF-12803': { type: 'MODAL_RECONNECT', title: '아이디 또는 비밀번호 오류',    message: '입력하신 금융사 아이디 또는 비밀번호가 올바르지 않습니다. 연동 정보를 확인해 주세요.',                                 actionLabel: '재연동하기' },
  'CF-12833': { type: 'MODAL_RECONNECT', title: '비밀번호 재설정 필요',         message: '금융사 비밀번호 재설정이 필요합니다. 금융사에서 비밀번호 변경 후 재연동해 주세요.',                                    actionLabel: '재연동하기' },
  'CF-00002': { type: 'MODAL_RECONNECT', title: '연동 정보 재설정 필요',        message: '금융사 인증 정보가 변경되었습니다. 아이디/비밀번호를 다시 확인하고 재연동해 주세요.',                                  actionLabel: '재연동하기' },
  'CF-13031': { type: 'MODAL_RECONNECT', title: '증권 계좌 비밀번호 오류',      message: '증권 계좌 비밀번호가 올바르지 않습니다. 다시 연동해 주세요.',                                                          actionLabel: '재연동하기' },

  // 계정 잠김
  'CF-12802': { type: 'MODAL_INFO', title: '비밀번호 오류 횟수 초과', message: '비밀번호 오류로 계정이 잠겼습니다. 해당 금융사 홈페이지에서 잠김 해제 후 다시 연동해 주세요.',     actionLabel: '금융사 홈페이지', actionType: 'EXTERNAL_LINK' },
  'CF-12834': { type: 'MODAL_INFO', title: '계정 잠김 해제 필요',     message: '계정이 잠긴 상태입니다. 해당 금융사 홈페이지에서 잠김 해제 후 다시 연동해 주세요.',             actionLabel: '금융사 홈페이지', actionType: 'EXTERNAL_LINK' },
  'CF-12830': { type: 'MODAL_INFO', title: '로그인 횟수 초과',        message: '오늘 로그인 허용 횟수가 초과되었습니다. 내일 자동으로 다시 동기화됩니다.' },
  'CF-13032': { type: 'MODAL_INFO', title: '증권 계좌 비밀번호 잠김', message: '비밀번호 오류 횟수 초과로 계좌가 잠겼습니다. 증권사 홈페이지에서 잠김 해제 후 다시 연동해 주세요.', actionLabel: '증권사 홈페이지', actionType: 'EXTERNAL_LINK' },

  // 서버/타임아웃
  'CF-12003': { type: 'TOAST_ERROR', message: '금융사 서버에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
  'CF-01004': { type: 'TOAST_ERROR', message: '조회 시간이 초과되었습니다. 조회 기간을 줄이거나 잠시 후 다시 시도해 주세요.' },
  'CF-12200': { type: 'TOAST_ERROR', message: '금융사 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' },
  'CF-12202': { type: 'TOAST_ERROR', message: '금융사 서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.' },

  // 요청 한도
  'CF-00016': { type: 'TOAST_INFO', message: '이전 요청이 처리 중입니다. 잠시 후 다시 시도해 주세요.' },
  'CF-00012': { type: 'TOAST_INFO', message: '오늘 조회 한도를 초과했습니다. 내일 자동으로 다시 동기화됩니다.' },
  'CF-00006': { type: 'TOAST_INFO', message: '요청 건수가 초과되었습니다. 잠시 후 다시 시도해 주세요.' },
  'CF-12042': { type: 'TOAST_INFO', message: '조회 건수가 초과되었습니다. 잠시 후 다시 시도해 주세요.' },
  'CF-12055': { type: 'TOAST_INFO', message: '오늘 발급 횟수가 초과되었습니다. 내일 자동으로 다시 동기화됩니다.' },
};

export function resolveCodefError(errorCode: string): CodefErrorUx {
  return (
    CODEF_ERROR_UX[errorCode] ?? {
      type: 'TOAST_ERROR',
      message: '일시적인 오류가 발생했습니다. 문제가 지속되면 연동을 재설정해 주세요.',
    }
  );
}
