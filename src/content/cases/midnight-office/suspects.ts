/**
 * PUBLIC suspect profiles — player-facing only.
 * Excludes hiddenTruth and isCulprit by design. Spoiler fields are merged
 * in the folder's index.ts from the private _spoilers module.
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
  /** Notes from the first-round police interview (player-facing). */
  interviewNotes: string;
  /** Sensitive topic to press during interrogation (player-facing). */
  pressurePoint: string;
  /** Subtle hint toward useful evidence — never reveals the answer. */
  visibleContradictionHint: string;
  /** Kept for compatibility with legacy surfaces that read policeNotes. */
  policeNotes: string;
};

export const suspects: PublicSuspect[] = [
  {
    id: "s1",
    name: "박민수",
    age: 38,
    occupation: "기획전략실 대리",
    relationship:
      "피해자의 직속 부하. 최근 신규 사업 TF에서 피해자와 가장 자주 함께 일했다.",
    personality:
      "말투는 차분하고 논리적이다. 답변이 지나치게 정리되어 있어, 상황을 미리 정돈해둔 듯한 인상을 준다.",
    initialStatement:
      "그 시간엔 제 자리에서 자료를 정리하고 있었습니다. 팀장님과 따로 이야기한 건 없습니다.",
    alibi:
      "본인 자리에서 야근 중이었다고 주장.",
    firstImpression:
      "말투는 차분하지만 답변이 지나치게 정리되어 있다.",
    interviewNotes:
      "피해자와 업무상 가장 자주 부딪히던 인물. 질문을 받을 때 감정 표현은 적지만, 특정 시간대에 대한 답변이 모호하다.",
    pressurePoint:
      "피해자와의 마지막 대화.",
    visibleContradictionHint:
      "그의 진술은 출입문과 시간 관련 증거와 함께 다시 확인할 필요가 있다.",
    policeNotes:
      "피해자와 업무상 가장 자주 부딪히던 인물. 질문을 받을 때 감정 표현은 적지만, 특정 시간대에 대한 답변이 모호하다.",
  },
  {
    id: "s2",
    name: "이서연",
    age: 34,
    occupation: "디자인팀 팀장",
    relationship:
      "피해자와 프로젝트 일정 및 산출물 품질 문제로 여러 차례 충돌했다.",
    personality:
      "침착하지만 방어적이다. 프로젝트 이야기로 화제가 넘어가면 목소리가 미묘하게 날카로워진다.",
    initialStatement:
      "회의가 끝난 뒤 바로 나갔습니다. 더 남아 있을 이유가 없었어요.",
    alibi:
      "회의 종료 후 귀가했다고 주장.",
    firstImpression:
      "침착하지만 질문이 깊어질수록 방어적으로 변한다.",
    interviewNotes:
      "피해자와 프로젝트 일정 문제로 충돌한 기록이 있다. 감정적 동기는 있어 보이지만, 사건 현장에 남아 있었다는 직접 증거는 아직 없다.",
    pressurePoint:
      "회의 종료 후 실제 동선.",
    visibleContradictionHint:
      "그녀의 진술은 CCTV 공백과 퇴근 동선을 함께 검토해야 한다.",
    policeNotes:
      "피해자와 프로젝트 일정 문제로 충돌한 기록이 있다. 감정적 동기는 있어 보이지만, 사건 현장에 남아 있었다는 직접 증거는 아직 없다.",
  },
  {
    id: "s3",
    name: "최지훈",
    age: 31,
    occupation: "개발팀 선임",
    relationship:
      "신규 사업 TF의 기술 실무 담당. 피해자에게 일정 지연 문제로 여러 차례 압박을 받았다.",
    personality:
      "대답이 빠르지만 눈을 자주 피한다. 질문이 길어질수록 손을 마주 잡거나 자세를 자주 바꾼다.",
    initialStatement:
      "잠깐 커피를 마시러 나갔다 온 것뿐입니다. 정확한 시간은 기억이 잘 안 납니다.",
    alibi:
      "커피를 마시러 자리를 비웠다고 주장.",
    firstImpression:
      "빠르게 답하지만 눈을 잘 마주치지 않는다.",
    interviewNotes:
      "사건 시간 전후의 동선이 가장 흐릿하다. 단순히 긴장한 것인지, 숨기는 것이 있는지는 아직 알 수 없다.",
    pressurePoint:
      "자리를 비운 정확한 시간.",
    visibleContradictionHint:
      "그의 진술은 CCTV 기록과 회의실 시계의 시간 차이를 함께 확인해야 한다.",
    policeNotes:
      "사건 시간 전후의 동선이 가장 흐릿하다. 단순히 긴장한 것인지, 숨기는 것이 있는지는 아직 알 수 없다.",
  },
  {
    id: "s4",
    name: "한유리",
    age: 36,
    occupation: "인사팀 과장",
    relationship:
      "피해자의 인사평가 검토 업무를 함께 진행했다. 최근 피해자와 비공개 면담이 있었다.",
    personality:
      "조사에 협조적이지만 긴장한 기색을 감추지 못한다. 질문을 받을 때 손을 자주 만진다.",
    initialStatement:
      "인사평가 관련해서 한 팀장님과 이야기를 나눈 건 맞습니다. 하지만 사건과는 상관없습니다.",
    alibi:
      "인사팀 자료를 정리한 뒤 사무실을 떠났다고 주장.",
    firstImpression:
      "협조적이지만 지나치게 조심스럽다.",
    interviewNotes:
      "피해자의 최근 업무와 밀접하게 연결되어 있다. 직접적인 적대감은 보이지 않지만, 민감한 내부 자료를 알고 있었을 가능성이 있다.",
    pressurePoint:
      "피해자가 검토하던 인사평가 자료.",
    visibleContradictionHint:
      "그녀의 진술은 피해자의 노트북 기록과 함께 다시 볼 필요가 있다.",
    policeNotes:
      "피해자의 최근 업무와 밀접하게 연결되어 있다. 직접적인 적대감은 보이지 않지만, 민감한 내부 자료를 알고 있었을 가능성이 있다.",
  },
];
