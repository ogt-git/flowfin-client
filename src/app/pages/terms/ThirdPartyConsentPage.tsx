export function ThirdPartyConsentPage() {
  return (
    <div className="text-sm leading-relaxed text-gray-800">
      <p className="mb-4 text-xs text-gray-500">시행일: 2026년 6월 14일 | 버전: 2.0</p>
      <p className="mb-4">
        플로우핀(이하 "회사")은 「개인정보 보호법」 제17조에 따라 회원의 개인정보를 제3자에게 제공하는 경우 회원의
        사전 동의를 받습니다.
      </p>
      <div className="mb-6 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
        <p className="font-semibold text-gray-700">제3자 제공과 처리위탁의 구분</p>
        <p className="mt-1">
          "제3자 제공"은 외부 기관이 자신의 목적을 위해 회원의 정보를 이용하는 경우를 말합니다. "처리위탁"은 회사의
          업무를 처리하기 위해 외부 기관에 정보 처리를 맡기는 것으로, 위탁받은 기관은 회사의 지시에 따라서만 정보를
          처리합니다. 본 문서의 [제1장]은 제3자 제공을, [제2장]은 처리위탁을 각각 안내합니다.
        </p>
      </div>

      {/* 제1장 */}
      <h2 className="mb-3 border-b border-gray-300 pb-1 font-semibold text-gray-900">제1장. 개인정보 제3자 제공</h2>
      <p className="mb-4 text-xs text-gray-600">
        회사는 원칙적으로 회원의 개인정보를 외부에 제공하지 아니합니다. 다만 다음 각 조에 해당하는 경우에 한하여
        제공합니다.
      </p>

      <section className="mb-5">
        <h3 className="mb-2 font-semibold">제1조. 회원의 명시적 선택에 의한 제3자 제공</h3>
        <p className="mb-2 text-xs text-gray-600">① 커뮤니티 내 지출·자산 데이터 공유</p>
        <table className="mb-2 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 align-top whitespace-nowrap">제공받는 자</td>
              <td className="py-1.5">플로우핀 커뮤니티의 다른 회원 (불특정 다수)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 align-top whitespace-nowrap">제공 시점</td>
              <td className="py-1.5">회원이 커뮤니티 게시글에 본인의 지출·자산 데이터를 직접 첨부하여 게시하는 시점</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 align-top whitespace-nowrap">제공 목적</td>
              <td className="py-1.5">회원 간 금융 경험 교류 및 정보 공유</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600 align-top whitespace-nowrap">제공 항목</td>
              <td className="py-1.5">
                회원이 명시적으로 첨부를 선택한 항목에 한정 (예: 카테고리별 지출 비율, 자산 구성 비율, AI 포트폴리오
                추천 결과 등)
                <span className="mt-0.5 block text-gray-500">
                  단, 카드번호·계좌번호·이메일·이름 등 회원 식별 정보는 제공되지 않습니다.
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600 align-top whitespace-nowrap">보유 및 이용 기간</td>
              <td className="py-1.5">
                회원이 해당 게시글을 직접 삭제하거나 탈퇴할 때까지.
                <span className="mt-0.5 block text-gray-500">
                  단, 다른 회원이 이미 열람·저장한 경우 회사가 이를 회수할 수 없습니다.
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="space-y-1 rounded bg-gray-50 p-2 text-xs text-gray-500">
          <p>※ 커뮤니티 게시글 작성 화면에서 데이터 첨부 옵션을 선택하는 시점에 이 동의의 의사를 재확인합니다.</p>
          <p>
            ※ 본 항목에 동의하지 아니하더라도, 일반 게시글 작성·열람·댓글 등 모든 커뮤니티 기능은 정상 이용
            가능합니다.
          </p>
        </div>
      </section>

      <section className="mb-5">
        <h3 className="mb-2 font-semibold">제2조. 관계 법령에 따른 제공</h3>
        <p className="mb-2 text-xs text-gray-600">
          회사는 다음 각 호에 해당하는 경우 회원의 별도 동의 없이도 관계 법령에 따라 개인정보를 제3자에게 제공할 수
          있습니다. 이는 「개인정보 보호법」 제17조 및 제18조에 따른 적법한 제공으로, 회원의 동의 대상이 아닙니다.
        </p>
        <ol className="ml-4 list-decimal space-y-1 text-xs text-gray-700">
          <li>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
          <li>범죄의 수사 등을 위하여 수사기관이 법령에 따라 적법한 절차(영장 등)를 거쳐 정보를 요구하는 경우</li>
          <li>회원 또는 제3자의 급박한 생명·신체·재산의 이익을 위하여 필요하다고 인정되는 경우</li>
          <li>
            통계작성 및 학술연구 등의 목적을 위하여 특정 개인을 알아볼 수 없는 형태로 가공하여 제공하는 경우
          </li>
        </ol>
        <p className="mt-2 text-xs text-gray-600">
          회사는 위 각 호에 따라 정보를 제공하는 경우에도 법령에서 정한 요건과 절차를 엄격히 준수하며, 가능한 범위
          내에서 회원에게 사실을 통지하기 위해 노력합니다.
        </p>
      </section>

      <section className="mb-5">
        <h3 className="mb-2 font-semibold">제3조. 향후 추가 제공 예정 사항</h3>
        <p className="mb-2 text-xs text-gray-600">
          현재 시점에서 회사는 제1조 및 제2조 외에 회원의 개인정보를 제3자에게 제공할 계획이 없습니다.
        </p>
        <p className="mb-1 text-xs text-gray-600">
          다만, 향후 다음과 같은 사유로 추가 제공이 필요한 경우 회사는 변경된 내용을 사전에 고지하고 별도의 동의를
          받은 후에 진행합니다.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-xs text-gray-700">
          <li>회사가 새로운 제휴 서비스를 도입하여 회원이 해당 서비스를 직접 신청하는 경우</li>
          <li>영업 양도·합병 등의 사유로 회원의 개인정보가 이전되어야 하는 경우</li>
        </ul>
        <p className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-500">
          ※ 영업 양도·합병 등으로 인한 개인정보 이전의 경우, 회사는 「개인정보 보호법」 제27조에 따라 이전 사실,
          이전받는 자의 정보, 이전을 원하지 아니하는 회원의 조치 방법 등을 이전 30일 전에 서비스 공지사항 및
          이메일로 사전 고지합니다.
        </p>
      </section>

      <section className="mb-5">
        <h3 className="mb-2 font-semibold">제4조. 동의 거부 권리 및 거부 시 불이익</h3>
        <p className="mb-2 text-xs text-gray-600">회원은 본 동의를 거부할 권리가 있습니다. 항목별 거부 시 영향은 다음과 같습니다.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">항목</th>
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">
                  동의 거부 시 제한되는 기능
                </th>
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">
                  계속 이용 가능한 기능
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="border border-gray-200 px-2 py-1.5 align-top">① 커뮤니티 내 데이터 공유</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">
                  커뮤니티 게시글에 본인 지출·자산 데이터 첨부 불가
                </td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">
                  일반 게시글 작성·열람·댓글·좋아요 등 모든 커뮤니티 기능
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1.5 align-top">제2조 법령 제공</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top text-gray-500">
                  법령상 강제 규정으로, 거부 의사와 무관하게 적용됩니다
                </td>
                <td className="border border-gray-200 px-2 py-1.5 align-top text-gray-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-2 font-semibold">제5조. 동의의 철회</h3>
        <p className="mb-1 text-xs text-gray-700">① 회원은 본 동의서를 통하여 동의한 사항에 대하여 언제든지 동의를 철회할 수 있습니다.</p>
        <p className="mb-1 text-xs text-gray-700">② 커뮤니티 내 데이터 공유 동의의 철회는 다음 방법으로 가능합니다.</p>
        <ul className="ml-4 list-disc space-y-1 text-xs text-gray-600">
          <li>게시글을 직접 삭제하면 해당 게시글에 포함된 데이터 공유가 중단됩니다.</li>
          <li>
            이미 첨부된 게시글을 삭제하지 않고 향후 데이터 첨부를 원하지 않는 경우, 새 게시글 작성 시 첨부 옵션을
            선택하지 않으면 됩니다.
          </li>
          <li>
            추가 문의는 개인정보 보호책임자 이메일(rudxor9@skuniv.ac.kr)로 요청하실 수 있으며, 회사는 지체 없이
            조치합니다.
          </li>
        </ul>
        <p className="mt-2 text-xs text-gray-600">
          ③ 동의 철회는 철회 시점 이후의 개인정보 제공에 대해 효력이 발생하며, 철회 이전에 이미 다른 회원이 열람한
          내용에 대해서는 소급 적용되지 않습니다.
        </p>
      </section>

      {/* 제2장 */}
      <h2 className="mb-3 border-b border-gray-300 pb-1 font-semibold text-gray-900">제2장. 개인정보 처리위탁</h2>
      <p className="mb-4 text-xs text-gray-600">
        회사는 「개인정보 보호법」 제26조에 따라 서비스 운영에 필요한 업무의 일부를 외부 전문 기관에 위탁하고 있습니다.
        수탁업체는 회사의 지시에 따라 위탁받은 업무 범위 내에서만 개인정보를 처리하며, 위탁 목적 이외의 용도로
        이용하거나 제3자에게 제공하지 않습니다.
      </p>

      <section className="mb-5">
        <h3 className="mb-2 font-semibold">제6조. 처리위탁 현황</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">수탁업체</th>
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">위탁 업무</th>
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">위탁 정보 항목</th>
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">처리 위치</th>
                <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-700">보유 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="border border-gray-200 px-2 py-1.5 align-top font-medium">주식회사 코드에프</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">카드·증권 금융정보 수집 중계</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">
                  금융기관 로그인 아이디, 연동 식별값, 카드·증권 연동 처리 정보
                </td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">국내</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">연동 해제 또는 회원 탈퇴 시까지</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1.5 align-top font-medium">OpenAI, Inc.</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">지출 자동 분류, AI 포트폴리오 추천</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">
                  카테고리별 지출 합계, 자산 유형별 보유금액, 투자성향 결과
                  <span className="mt-0.5 block text-gray-500">(이름·이메일·계좌번호·카드번호 등 개인 식별 정보 미포함)</span>
                </td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">국외 (미국)</td>
                <td className="border border-gray-200 px-2 py-1.5 align-top">AI 분석 요청 시 일회성 처리, 응답 완료 시까지</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-2 space-y-1 rounded bg-gray-50 p-2 text-xs text-gray-500">
          <p>
            ※ 개인정보 처리위탁은 회원의 별도 동의 없이 고지만으로 진행됩니다. 수탁업체의 개인정보 보호 정책은 해당
            업체의 공식 홈페이지를 통해 확인하실 수 있습니다.
          </p>
          <p>※ OpenAI, Inc.는 미국 소재 법인입니다. 위 정보는 AI 분석 처리를 위해 미국으로 이전됩니다.</p>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-2 font-semibold">제7조. 위탁 현황 변경 시 안내</h3>
        <p className="text-xs text-gray-600">
          수탁업체가 변경되거나 위탁 업무의 범위·내용이 변경되는 경우, 회사는 변경 30일 전에 서비스 공지사항을 통해
          사전 고지합니다. 중요한 변경 사항의 경우 회원의 이메일로도 개별 안내합니다.
        </p>
      </section>

      {/* 체크박스 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <label className="flex cursor-pointer items-start gap-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300" />
          <span className="text-sm text-gray-800">
            커뮤니티 내 지출·자산 데이터 공유에 관한 제3자 제공에 동의합니다.{' '}
            <span className="font-semibold text-gray-500">(선택)</span>
          </span>
        </label>
      </div>

      <p className="text-xs text-gray-400">부칙: 본 동의서는 2026년 6월 14일부터 시행합니다.</p>
    </div>
  );
}
