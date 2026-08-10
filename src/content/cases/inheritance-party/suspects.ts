/**
 * PUBLIC suspect profiles for CASE002 — player-facing only.
 * Excludes hiddenTruth and isCulprit by design; spoiler fields are merged
 * in this folder's index.ts from the private _spoilers module.
 */
export type PublicSuspect = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationship: string;
  personality: string;
  initialStatement: string;
  alibi: string;
  firstImpression: string;
  interviewNotes: string;
  pressurePoint: string;
  visibleContradictionHint: string;
  /** Legacy alias read by some surfaces. */
  policeNotes: string;
};

export const suspects: PublicSuspect[] = [
  {
    id: "s1",
    name: "한지원",
    age: 37,
    occupation: "한성물산 브랜드전략팀 이사 · 피해자의 여동생",
    relationship:
      "피해자의 첫째 여동생. 이번 유언장에서 지분 승계 대상에서 제외되었다.",
    personality:
      "말이 빠르고 논리가 앞선다. 감정을 드러내는 대신 상황을 설명하려 하고, 불리한 질문에는 문장이 길어진다.",
    initialStatement:
      "낭독이 끝나고 바로 2층으로 올라갔어요. 혼자 있고 싶었습니다. 응접실에는 축배 때만 있었고요.",
    alibi: "21:05경부터 2층 개인 방에 혼자 있었다고 주장.",
    firstImpression:
      "가장 먼저 진술에 응했고, 자신이 배제된 사실을 스스로 먼저 언급했다. 협조적이지만 시선이 자주 벽난로 쪽으로 향한다.",
    interviewNotes:
      "1차 면담에서 유언장 초안을 '본 적 없다'고 답했으나, 초안 조항의 문구를 정확히 인용했다. 2층으로 올라간 시각을 두 번 다르게 말했다.",
    pressurePoint:
      "낭독 이전에 이미 자신의 배제 사실을 알고 있었는지, 그리고 어떤 문서를 통해 알았는지.",
    visibleContradictionHint:
      "벽난로 쪽 흔적과 그녀의 '서재에 들어가지 않았다'는 진술을 나란히 두면 어긋나는 지점이 있다.",
    policeNotes:
      "상속 배제 당사자. 문서 접근 이력 확인 필요. 감정 반응보다 진술 정합성에 주목.",
  },
  {
    id: "s2",
    name: "윤미란",
    age: 59,
    occupation: "한씨 가족재단 상임이사 · 피해자의 계모",
    relationship:
      "고인의 재혼 배우자. 지난 6년간 가족재단의 실무 집행을 단독으로 관리해 왔다.",
    personality:
      "차분하고 흐트러짐이 없다. 질문의 범위를 먼저 정리해 답하며, 감정적인 표현을 거의 쓰지 않는다.",
    initialStatement:
      "저는 만찬 준비 때문에 계속 조리실과 응접실을 오갔습니다. 재훈이가 쓰러졌을 때는 문 앞에 있었어요.",
    alibi: "21:00~21:20 사이 조리실과 응접실을 오갔다고 주장. 가사 인력이 일부 시간대만 확인.",
    firstImpression:
      "가장 침착했다. 응급 조치를 지시한 것도 그였다. 다만 자신이 어느 시각에 어디 있었는지를 스스로 정확히 특정했다 — 아무도 묻지 않았을 때부터.",
    interviewNotes:
      "재단 운영에 대한 질문에서만 답변 속도가 느려졌다. 피해자가 '발표할 것이 있다'고 말한 사실은 알고 있었다고 인정했으나 내용은 몰랐다고 주장.",
    pressurePoint:
      "축배 이후 조리실과 응접실 사이 동선, 그리고 재단 집행 내역 재검토 일정을 언제 알았는지.",
    visibleContradictionHint:
      "그녀가 말한 동선은 저택 내부 기록과 완전히 겹치지 않는다. 겹치지 않는 구간이 어디인지가 중요하다.",
    policeNotes:
      "재단 실무 단독 관리자. 알리바이는 부분적으로만 확인됨. 진술이 지나치게 정돈되어 있음.",
  },
  {
    id: "s3",
    name: "한성준",
    age: 33,
    occupation: "무직 (전 스타트업 대표) · 피해자의 남동생",
    relationship:
      "피해자의 막내 동생. 최근 사업 실패 후 형에게 자금 지원을 요청했다가 거절당했다.",
    personality:
      "감정이 앞서고 진술이 흔들린다. 방어적으로 말하다가 갑자기 인정하는 패턴이 반복된다.",
    initialStatement:
      "저는 대부분 정원 쪽 테라스에 있었습니다. 형하고는 낭독 전에 잠깐 얘기했고 그게 마지막이에요.",
    alibi: "21:00 이후 테라스에서 흡연 중이었다고 주장. 확인 증인은 없음.",
    firstImpression:
      "손이 계속 떨렸고, 묻지 않은 부분까지 먼저 부인했다. 셔츠 왼쪽 커프스가 비어 있었다.",
    interviewNotes:
      "채무 규모에 대해서는 축소해 답했다. 피해자의 휴대전화에 대해 물었을 때 처음으로 답변이 끊겼다.",
    pressurePoint:
      "축배 전후 바 카트 근처에 있었는지, 그리고 피해자의 휴대전화를 만졌는지.",
    visibleContradictionHint:
      "바 카트 아래에서 나온 작은 물건이 그의 옷차림과 맞는다. 다만 그것만으로는 독이 설명되지 않는다.",
    policeNotes:
      "고액 사채 채무 확인. 바 카트 근처 물리적 흔적 존재. 동기는 충분하나 경로 검증 필요.",
  },
  {
    id: "s4",
    name: "한서연",
    age: 39,
    occupation: "변호사 (가사·상속 전문) · 피해자의 배우자",
    relationship:
      "피해자의 배우자. 결혼 9년차. 최근 별거 논의가 있었다는 소문이 가족 내에 있었다.",
    personality:
      "직업적으로 훈련된 화법을 쓴다. 질문을 되묻고, 사실과 추측을 분리해 답한다.",
    initialStatement:
      "저는 응접실 소파 쪽에 있었습니다. 남편이 위스키를 따르는 것도 봤고, 쓰러지는 것도 봤습니다.",
    alibi: "축배 전후 응접실에 계속 있었다고 주장. 복수의 목격자가 부분 확인.",
    firstImpression:
      "감정 표현이 적었고, 사망 확인 직후 가장 먼저 문서 보관 상태를 물었다. 유족으로서는 이례적인 순서였다.",
    interviewNotes:
      "혼전계약 관련 분쟁을 처음에는 부인했다가, 서류를 언급하자 '협의 중이었다'고 정정했다. 재산 관련 문서를 사전에 열람한 사실은 인정.",
    pressurePoint:
      "별거 및 혼전계약 분쟁의 실제 진행 단계, 그리고 재산 문서를 열람한 목적.",
    visibleContradictionHint:
      "그녀가 숨긴 것은 사건이 아니라 자신의 이해관계다. 문서와 시간대를 분리해서 볼 필요가 있다.",
    policeNotes:
      "재산 분쟁 당사자. 문서 열람 이력 존재. 응접실 체류 알리바이는 비교적 견고함.",
  },
];
