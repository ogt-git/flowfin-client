export function PrivacyPolicyPage() {
  return (
    <div className="text-sm leading-relaxed text-gray-800">
      <p className="mb-1 text-xs text-gray-500">시행일: 2026년 6월 14일 | 버전: 2.0</p>
      <p className="mb-4 text-xs text-gray-500">
        플로우핀(이하 "회사")은 「개인정보 보호법」 제15조 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제22조에 따라
        회원의 개인정보 수집·이용에 관하여 다음과 같이 안내드립니다.
      </p>

      {/* 1. 필수 수집·이용 동의 */}
      <section className="mb-4">
        <h3 className="mb-2 font-semibold">1. 필수 수집·이용 동의</h3>

        <p className="mb-1 text-xs font-medium text-gray-600">① 회원 가입 및 관리</p>
        <table className="mb-3 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">수집 목적</td>
              <td className="py-1.5">회원 식별, 본인 확인, 로그인 인증, 회원자격 유지·관리, 부정이용 방지, 공지 발송</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목</td>
              <td className="py-1.5">이메일, 비밀번호, 이름, 약관 동의 버전 및 동의 일시, 가입 일시, 로그인 상태 유지를 위한 보안 인증 정보</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">보유 기간</td>
              <td className="py-1.5">회원 탈퇴 시까지</td>
            </tr>
          </tbody>
        </table>
        <p className="mb-3 rounded bg-gray-50 p-2 text-xs text-gray-500">
          ※ 비밀번호는 복호화가 불가능한 단방향 해시 방식으로 저장됩니다.<br />
          ※ 이메일은 단방향 해시값과 함께 보관되어 중복 확인 및 본인 식별 용도로만 사용됩니다.<br />
          ※ 로그인 상태 유지를 위한 임시 인증 정보는 스크립트 접근이 차단된 보안 쿠키에 저장되며, 로그아웃 시 즉시 삭제됩니다.
        </p>

        <p className="mb-1 text-xs font-medium text-gray-600">② 금융정보 연동 서비스 제공</p>
        <table className="mb-3 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">수집 목적</td>
              <td className="py-1.5">카드·증권 계정의 청구내역·자산정보 수집, 지출 분석 및 자산 통합 조회 서비스 제공</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목 (카드)</td>
              <td className="py-1.5">금융기관명, 금융기관 로그인 아이디, 연동 식별값, 카드번호 일부, 카드 청구내역 (가맹점명·거래일시·승인금액·카드사명), 지출 카테고리, 분류 방식, 회원이 수정한 분류 정보</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목 (증권)</td>
              <td className="py-1.5">증권사명, 계좌번호, 보유종목명, 보유수량, 평가금액, 평가손익, 수익률, 예수금, 갱신 일시</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목 (수동 자산)</td>
              <td className="py-1.5">자산명, 자산 유형, 평가금액 (회원이 직접 등록한 경우에 한함)</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">보유 기간</td>
              <td className="py-1.5">회원 탈퇴 또는 해당 연동 해지 시까지 (먼저 도래하는 시점 기준)</td>
            </tr>
          </tbody>
        </table>
        <p className="mb-3 rounded bg-gray-50 p-2 text-xs text-gray-500">
          ※ 카드번호·증권 계좌번호·연동 식별값·금융기관 로그인 아이디는 국제 표준 양방향 암호화 알고리즘으로 저장됩니다.<br />
          ※ 금융기관 비밀번호는 서버에 저장하지 않습니다. 금융정보 수집 중계 서비스를 통해 해당 금융회사로 전달된 후 즉시 폐기됩니다.<br />
          ※ 금융정보는 매일 새벽 자동으로 수집되며, 회원이 수동 새로고침을 요청할 경우에도 수집됩니다.
        </p>

        <p className="mb-1 text-xs font-medium text-gray-600">③ AI 포트폴리오 추천 서비스 제공</p>
        <table className="mb-3 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">수집 목적</td>
              <td className="py-1.5">투자성향 진단, 투자가능금액 산출, 인공지능 분석 엔진을 통한 자산 배분 추천 정보 생성</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목</td>
              <td className="py-1.5">투자성향 응답 결과 (위험 선호도, 투자 목적, 투자 기간), 포트폴리오 추천 결과 및 요청 이력</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">보유 기간</td>
              <td className="py-1.5">회원 탈퇴 시까지</td>
            </tr>
          </tbody>
        </table>

        <p className="mb-1 text-xs font-medium text-gray-600">④ 커뮤니티 서비스 제공</p>
        <table className="mb-3 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">수집 목적</td>
              <td className="py-1.5">게시글·댓글 작성, 좋아요 표시, 커뮤니티 운영 및 건전한 이용 환경 유지</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목</td>
              <td className="py-1.5">게시글·댓글 내용, 회원이 선택적으로 첨부한 포트폴리오 추천 결과, 작성 일시, 좋아요 내역</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">보유 기간</td>
              <td className="py-1.5">회원 탈퇴 시까지 (삭제한 댓글은 '삭제된 댓글입니다'로 표시, 작성자 식별 정보 즉시 제거)</td>
            </tr>
          </tbody>
        </table>

        <p className="mb-1 text-xs font-medium text-gray-600">⑤ 서비스 이용 기록 및 부정 이용 방지</p>
        <table className="mb-3 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">수집 목적</td>
              <td className="py-1.5">서비스 이용기록 보관, 부정 이용 방지, 불법행위 대응, 서비스 오류 분석</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목</td>
              <td className="py-1.5">접속 IP 주소, 접속 일시, 서비스 이용 기록, 브라우저 종류 및 운영체제 정보</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">보유 기간</td>
              <td className="py-1.5">3개월 (「통신비밀보호법」)</td>
            </tr>
          </tbody>
        </table>

        <p className="mb-1 text-xs font-medium text-gray-600">⑥ 관계 법령에 따른 의무 보관 정보</p>
        <table className="mb-1 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="py-1.5 pr-3 text-left font-medium text-gray-600">보관 정보</th>
              <th className="py-1.5 pr-3 text-left font-medium text-gray-600">근거 법령</th>
              <th className="py-1.5 text-left font-medium text-gray-600">보관 기간</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3">계약 또는 청약 철회에 관한 기록</td>
              <td className="py-1.5 pr-3">전자상거래 등에서의 소비자보호에 관한 법률</td>
              <td className="py-1.5">5년</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3">소비자의 불만 또는 분쟁처리에 관한 기록</td>
              <td className="py-1.5 pr-3">전자상거래 등에서의 소비자보호에 관한 법률</td>
              <td className="py-1.5">3년</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3">본인 확인에 관한 기록</td>
              <td className="py-1.5 pr-3">정보통신망 이용촉진 및 정보보호 등에 관한 법률</td>
              <td className="py-1.5">6개월</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3">접속에 관한 기록</td>
              <td className="py-1.5 pr-3">통신비밀보호법</td>
              <td className="py-1.5">3개월</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 2. 선택 수집·이용 동의 */}
      <section className="mb-4">
        <h3 className="mb-2 font-semibold">2. 선택 수집·이용 동의</h3>
        <p className="mb-2 text-xs text-gray-500">다음 항목은 동의하지 아니하더라도 서비스 이용에 어떠한 제한도 없습니다.</p>

        <p className="mb-1 text-xs font-medium text-gray-600">① 서비스 개선을 위한 통계 분석</p>
        <table className="mb-3 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">수집 목적</td>
              <td className="py-1.5">서비스 품질 향상, 사용 패턴 분석, 신규 기능 개발을 위한 통계 자료 작성</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목</td>
              <td className="py-1.5">회원이 식별되지 아니하는 형태로 비식별 처리된 지출·자산·포트폴리오 사용 데이터</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">보유 기간</td>
              <td className="py-1.5">회원 탈퇴 후 1년 또는 동의 철회 시까지</td>
            </tr>
          </tbody>
        </table>

        <p className="mb-1 text-xs font-medium text-gray-600">② 마케팅 정보 수신</p>
        <table className="mb-1 w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">수집 목적</td>
              <td className="py-1.5">새로운 서비스·이벤트·혜택 안내, 광고성 정보 전송</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">수집 항목</td>
              <td className="py-1.5">이메일, 마케팅 수신 동의 여부 및 동의 일시</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">보유 기간</td>
              <td className="py-1.5">회원 탈퇴 또는 마케팅 수신 동의 철회 시까지</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1 rounded bg-gray-50 p-2 text-xs text-gray-500">
          ※ 마케팅 정보 발송 기능은 현재 준비 중이며, 기능이 활성화된 이후부터 발송이 시작됩니다.
        </p>
      </section>

      {/* 3. 파기 절차 */}
      <section className="mb-4">
        <h3 className="mb-1 font-semibold">3. 개인정보의 파기 절차 및 방법</h3>
        <div className="space-y-1 text-sm">
          <p>① 회원이 탈퇴를 요청하거나 보유 기간이 경과한 경우 해당 개인정보를 지체 없이 파기합니다. 법령에 의한 보관이 필요한 정보는 별도 데이터베이스에 분리 보관하며, 보관 기간 만료 즉시 파기합니다.</p>
          <p>② 전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제하며, 종이 문서는 분쇄 또는 소각합니다.</p>
          <p>③ 금융기관 연동 해제 시, 해당 금융기관에서 수집된 금융 데이터는 즉시 삭제됩니다.</p>
        </div>
      </section>

      {/* 4. 안전성 확보 조치 */}
      <section className="mb-4">
        <h3 className="mb-2 font-semibold">4. 개인정보의 안전성 확보 조치</h3>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="py-1.5 pr-3 text-left font-medium text-gray-600">항목</th>
              <th className="py-1.5 text-left font-medium text-gray-600">적용 방식</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">비밀번호</td>
              <td className="py-1.5">복호화가 불가능한 단방향 해시 방식으로 저장</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">이메일 주소</td>
              <td className="py-1.5">단방향 해시 방식으로 저장 (평문 조회 불가)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">계좌번호·카드번호·연동 식별값·금융기관 로그인 아이디</td>
              <td className="py-1.5">국제 표준 양방향 암호화 알고리즘 적용</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">통신 구간</td>
              <td className="py-1.5">HTTPS/TLS 암호화 적용</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">로그인 상태 유지 인증 정보</td>
              <td className="py-1.5">스크립트 접근이 차단된 보안 쿠키에 저장, 로그아웃 시 즉시 삭제</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium">화면 표시</td>
              <td className="py-1.5">카드번호·계좌번호 일부 자릿수 마스킹 처리</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 5. 만 14세 미만 */}
      <section className="mb-4">
        <h3 className="mb-1 font-semibold">5. 만 14세 미만 아동의 개인정보 보호</h3>
        <div className="space-y-1 text-sm">
          <p>① 플로우핀 서비스는 만 14세 이상 이용자를 대상으로 제공합니다.</p>
          <p>② 만 14세 미만 아동은 서비스에 가입할 수 없으며, 가입 과정에서 확인된 경우 가입이 거부됩니다.</p>
          <p>③ 만 14세 미만 아동의 개인정보가 법정대리인의 동의 없이 수집된 것으로 확인된 경우, 회사는 해당 정보를 지체 없이 파기합니다.</p>
        </div>
      </section>

      {/* 6. 이용자 권리 */}
      <section className="mb-4">
        <h3 className="mb-2 font-semibold">6. 이용자의 권리 및 행사 방법</h3>
        <table className="mb-2 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="py-1.5 pr-3 text-left font-medium text-gray-600">권리</th>
              <th className="py-1.5 text-left font-medium text-gray-600">내용</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">열람권</td>
              <td className="py-1.5">처리 중인 개인정보의 확인 요청</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">정정권</td>
              <td className="py-1.5">부정확한 개인정보의 정정 요청</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">삭제권</td>
              <td className="py-1.5">불필요하게 수집된 개인정보의 삭제 요청</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium">처리정지권</td>
              <td className="py-1.5">특정 목적의 개인정보 처리 정지 요청</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium">동의 철회권</td>
              <td className="py-1.5">수집·이용 동의의 언제든지 철회</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-600">마이페이지에서 직접 처리하거나, 개인정보 보호책임자 이메일로 요청하실 수 있습니다 (본인 확인 후 10영업일 이내 처리).</p>
        <div className="mt-2 text-xs text-gray-600">
          <p>침해 신고 기관: 개인정보보호위원회 (182) · 한국인터넷진흥원 개인정보침해신고센터 (118) · 대검찰청 사이버수사과 (02-3480-3571) · 경찰청 사이버수사국 (182)</p>
        </div>
      </section>

      {/* 7. 개인정보 보호책임자 */}
      <section className="mb-4">
        <h3 className="mb-2 font-semibold">7. 개인정보 보호책임자</h3>
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="w-24 py-1.5 pr-3 font-medium text-gray-600">성명</td>
              <td className="py-1.5">오경택</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 pr-3 font-medium text-gray-600">직책</td>
              <td className="py-1.5">개인정보 보호책임자</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-gray-600">연락처</td>
              <td className="py-1.5">rudxor9@skuniv.ac.kr</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 8. 동의 거부권 */}
      <section className="mb-6 rounded-md border border-red-200 bg-red-50 p-3">
        <h3 className="mb-2 font-semibold text-red-900">8. 동의 거부권 및 불이익 안내</h3>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-red-200">
              <th className="py-1.5 pr-3 text-left font-medium text-red-800">항목</th>
              <th className="py-1.5 text-left font-medium text-red-800">동의 거부 시 불이익</th>
            </tr>
          </thead>
          <tbody className="text-red-800">
            <tr className="border-b border-red-100">
              <td className="py-1.5 pr-3">① 회원 가입 및 관리</td>
              <td className="py-1.5">회원가입 불가, 서비스 전체 이용 불가</td>
            </tr>
            <tr className="border-b border-red-100">
              <td className="py-1.5 pr-3">② 금융정보 연동</td>
              <td className="py-1.5">카드·증권 자동 연동 서비스 이용 불가 (수동 자산 입력만 가능)</td>
            </tr>
            <tr className="border-b border-red-100">
              <td className="py-1.5 pr-3">③ AI 포트폴리오 추천</td>
              <td className="py-1.5">AI 포트폴리오 추천 서비스 이용 불가</td>
            </tr>
            <tr className="border-b border-red-100">
              <td className="py-1.5 pr-3">④ 커뮤니티 서비스</td>
              <td className="py-1.5">커뮤니티 서비스 이용 불가 (지출·자산 조회는 이용 가능)</td>
            </tr>
            <tr className="border-b border-red-100">
              <td className="py-1.5 pr-3">⑤⑥ 이용기록·법령 보관</td>
              <td className="py-1.5">법령상 의무 사항으로, 거부 시 서비스 이용 불가</td>
            </tr>
            <tr className="border-b border-red-100">
              <td className="py-1.5 pr-3">선택 ① 통계 분석</td>
              <td className="py-1.5">서비스 이용에 제한 없음</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3">선택 ② 마케팅 수신</td>
              <td className="py-1.5">서비스 이용에 제한 없음, 향후 마케팅 정보 미수신</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 체크박스
      <div className="space-y-2 border-t border-gray-200 pt-4">
        <label className="flex cursor-pointer items-start gap-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300" />
          <span className="text-sm text-gray-800">
            필수 항목에 대한 개인정보 수집·이용에 동의합니다.{' '}
            <span className="font-semibold text-red-600">(필수)</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300" />
          <span className="text-sm text-gray-800">
            선택 항목 ① 서비스 개선을 위한 통계 분석(비식별 정보 활용)에 동의합니다.{' '}
            <span className="font-medium text-gray-500">(선택)</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300" />
          <span className="text-sm text-gray-800">
            선택 항목 ② 마케팅 정보 수신에 동의합니다.{' '}
            <span className="font-medium text-gray-500">(선택)</span>
          </span>
        </label>
      </div>*/}

      <p className="mt-4 text-xs text-gray-400">부칙: 본 동의서는 2026년 6월 14일부터 시행합니다.</p>
    </div>
  );
}
