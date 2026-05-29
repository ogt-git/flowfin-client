export function ServiceTermsPage() {
  return (
    <div className="text-sm leading-relaxed text-gray-800">
      <p className="mb-1 text-xs text-gray-500">시행일: 2026년 6월 1일 | 버전: 1.0</p>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제1조 (목적)</h3>
        <p>
          본 약관은 플로우핀(이하 "회사")이 제공하는 개인 자산관리 및 소비분석 서비스(이하 "서비스")의
          이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제2조 (정의)</h3>
        <p>① "서비스"란 회사가 제공하는 지출 분석, 자산 통합 조회, AI 기반 포트폴리오 참고 정보 제공, 커뮤니티 등 관련 제반 서비스를 의미합니다.</p>
        <p>② "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</p>
        <p>③ "AI 분석"이란 이용자의 지출 및 자산 데이터를 기반으로 인공지능이 생성하는 참고 정보를 의미합니다.</p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제3조 (약관의 효력 및 변경)</h3>
        <p>① 본 약관은 이용자가 동의함으로써 효력이 발생합니다.</p>
        <p>② 회사는 관련 법령에 위배되지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일 7일 전에 서비스 내 공지합니다.</p>
        <p>③ 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
      </section>

      <section className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
        <h3 className="mb-1 font-semibold text-amber-900">제4조 (서비스의 성격 및 면책) ★ 핵심 조항</h3>
        <p className="text-amber-800">① 회사가 제공하는 포트폴리오 추천, 소비 분석, 자산 진단 등의 정보는 이용자의 재무 판단을 위한 참고 자료로서, 「자본시장과 금융투자업에 관한 법률」에 따른 투자자문업 또는 투자일임업에 해당하지 않습니다.</p>
        <p className="text-amber-800">② 회사는 투자자문업 등록을 하지 않은 정보기술(IT) 서비스 제공자로서, 이용자의 투자 결정 및 그에 따른 손익에 대해 어떠한 보증이나 책임을 부담하지 않습니다.</p>
        <p className="text-amber-800">③ 서비스에서 제공하는 AI 기반 추천은 알고리즘에 의한 자동 생성 결과이며, 투자 성과를 보장하지 않습니다. 과거 데이터에 기반한 분석은 미래 수익을 예측하거나 보장하는 것이 아닙니다.</p>
        <p className="text-amber-800">④ 이용자는 중요한 투자 결정 전 반드시 공인된 투자 전문가와 상담할 것을 권장하며, 최종 투자 판단과 그에 따른 책임은 전적으로 이용자 본인에게 있습니다.</p>
        <p className="font-semibold text-amber-900">⑤ 모든 투자에는 원금 손실의 위험이 있습니다.</p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제5조 (회원가입 및 탈퇴)</h3>
        <p>① 이용자는 회사가 정한 양식에 따라 회원정보를 기입하고 본 약관에 동의함으로써 회원가입을 신청합니다.</p>
        <p>② 이용자는 언제든지 서비스 내 탈퇴 기능을 통해 회원 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.</p>
        <p>③ 탈퇴 시 이용자의 개인정보 및 금융 데이터는 관련 법령에서 정한 보관 의무 기간을 제외하고 즉시 파기됩니다.</p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제6조 (이용자의 의무)</h3>
        <p>① 이용자는 가입 시 정확한 정보를 제공해야 하며, 변경 사항이 있을 경우 즉시 수정해야 합니다.</p>
        <p>② 이용자는 타인의 정보를 도용하여 서비스를 이용해서는 안 됩니다.</p>
        <p>③ 이용자는 서비스를 통해 취득한 정보를 회사의 사전 동의 없이 영리 목적으로 이용하거나 제3자에게 제공해서는 안 됩니다.</p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제7조 (서비스 이용 제한)</h3>
        <p>① 회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다.</p>
        <ol className="ml-4 list-decimal">
          <li>타인의 정보를 도용한 경우</li>
          <li>서비스 운영을 고의로 방해한 경우</li>
          <li>관련 법령 또는 본 약관을 위반한 경우</li>
        </ol>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제8조 (손해배상 책임의 제한)</h3>
        <p>① 회사는 무료로 제공하는 서비스와 관련하여 이용자에게 발생한 손해에 대해 책임을 부담하지 않습니다. 단, 회사의 고의 또는 중과실로 인한 경우는 제외합니다.</p>
        <p>② 회사는 이용자가 서비스에서 제공하는 정보를 이용하여 행한 투자 행위로 인한 손익에 대해 일체의 책임을 부담하지 않습니다.</p>
        <p>③ 회사는 천재지변, 시스템 장애, 외부 API 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 부담하지 않습니다.</p>
        <p>④ 회사는 CODEF API 등 외부 시스템에서 수집한 데이터의 정확성, 완전성, 적시성을 보증하지 않으며, 데이터 오류 또는 지연으로 인한 손해에 대해 책임을 부담하지 않습니다.</p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-semibold">제9조 (준거법 및 관할)</h3>
        <p>본 약관의 해석 및 분쟁 해결에 관해서는 대한민국 법령을 적용하며, 분쟁이 발생한 경우 회사 소재지 관할 법원을 전속 관할 법원으로 합니다.</p>
      </section>

      <section>
        <h3 className="mb-1 font-semibold">부칙</h3>
        <p>본 약관은 2026년 6월 1일부터 시행됩니다.</p>
      </section>
    </div>
  );
}
