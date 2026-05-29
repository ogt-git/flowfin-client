export function PrivacyPolicyPage() {
  return (
    <div className="text-sm leading-relaxed text-gray-800">
      <p className="mb-4 text-xs text-gray-500">시행일: 2026년 6월 1일 | 버전: 1.0</p>
      <p className="mb-4">플로우핀(이하 "회사")은 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.</p>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">1. 수집 항목</h3>
        <p>[필수] 이메일 주소, 비밀번호(암호화 저장), 이름</p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">2. 수집 목적</h3>
        <ul className="ml-4 list-disc space-y-1">
          <li>회원 가입 및 본인 식별</li>
          <li>서비스 제공 및 운영 (지출 분석, 자산 조회, AI 포트폴리오 참고 정보)</li>
          <li>서비스 이용 기록 관리 및 부정 이용 방지</li>
          <li>고객 문의 응대</li>
        </ul>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">3. 보유 및 이용 기간</h3>
        <p className="mb-1">회원 탈퇴 시 즉시 파기. 단, 관계 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>계약 또는 청약 철회에 관한 기록: 5년 (전자상거래법)</li>
          <li>로그인 기록: 3개월 (통신비밀보호법)</li>
        </ul>
      </section>

      <section className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
        <h3 className="mb-1 font-semibold text-red-900">4. 동의 거부권 및 불이익</h3>
        <p className="text-red-800">
          이용자는 개인정보 수집·이용에 대한 동의를 거부할 수 있습니다.
          다만, 필수 항목에 대한 동의를 거부할 경우 회원가입이 불가합니다.
        </p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">5. 개인정보의 안전성 확보 조치</h3>
        <ul className="ml-4 list-disc space-y-1">
          <li>비밀번호: BCrypt 단방향 암호화</li>
          <li>이메일: SHA-256 해시 저장 (평문 조회 불가)</li>
          <li>금융 데이터(계좌번호, 연동정보): AES-256 양방향 암호화</li>
          <li>통신 구간: HTTPS 적용</li>
          <li>응답 데이터: 카드번호·계좌번호 마스킹 처리</li>
        </ul>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">6. 개인정보 보호책임자</h3>
        <ul className="ml-4 list-disc space-y-1">
          <li>성명: 오경택</li>
          <li>연락처: rudxor9@skuniv.ac.kr</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-1 font-semibold">7. 이용자 권리</h3>
        <p>
          이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를
          요구할 수 있으며, 회원 탈퇴를 통해 개인정보 파기를 요청할 수 있습니다.
        </p>
      </section>
    </div>
  );
}
