export function ThirdPartyConsentPage() {
  return (
    <div className="text-sm leading-relaxed text-gray-800">
      <p className="mb-4 text-xs text-gray-500">시행일: 2026년 7월 1일 | 버전: 1.0</p>
      <p className="mb-4">
        플로우핀(이하 "회사")은 서비스 제공을 위해 아래와 같이 이용자의 개인정보를 제3자에게 제공합니다.
      </p>

      <section className="mb-4">
        <h3 className="mb-2 font-semibold">1. CODEF (코드에프)</h3>
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">제공받는 자</td>
              <td className="py-1.5">주식회사 코드에프</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">제공 목적</td>
              <td className="py-1.5">카드 청구내역 및 증권 종합자산 데이터 연동</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">제공 항목</td>
              <td className="py-1.5">이용자가 입력한 금융기관 로그인 정보 (아이디, 비밀번호), 연동 식별 정보 (Connected ID)</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">보유 기간</td>
              <td className="py-1.5">연동 해지 시 CODEF 서버에서 즉시 삭제 (deleteAccount API 호출)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-4">
        <h3 className="mb-2 font-semibold">2. OpenAI</h3>
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">제공받는 자</td>
              <td className="py-1.5">OpenAI, Inc.</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">제공 목적</td>
              <td className="py-1.5">AI 기반 포트폴리오 참고 정보 생성</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">제공 항목</td>
              <td className="py-1.5">
                월별 카테고리별 지출 합계, 자산 유형별 보유 금액, 투자성향
                <span className="mt-0.5 block text-gray-500">(이름·이메일 등 개인 식별 정보는 전달되지 않습니다)</span>
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600 whitespace-nowrap">보유 기간</td>
              <td className="py-1.5">API 호출 시 일회성 처리. OpenAI는 API를 통해 전달된 데이터를 모델 학습에 사용하지 않음 (OpenAI API Terms 참조)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-md border border-red-200 bg-red-50 p-3">
        <h3 className="mb-1 font-semibold text-red-900">3. 동의 거부권 및 불이익</h3>
        <p className="text-red-800">
          이용자는 개인정보 제3자 제공에 대한 동의를 거부할 수 있습니다.
          다만, 동의를 거부할 경우 금융 데이터 연동 및 AI 포트폴리오 추천 기능의 이용이 제한됩니다.
        </p>
      </section>
    </div>
  );
}
