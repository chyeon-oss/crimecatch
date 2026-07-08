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
  policeNotes: string;
  interviewPrompt: string;
  contradictionHint: string;
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
      "팀장님은 평소처럼 야근 중이셨습니다. 저도 제 자리에서 업무를 보고 있었고요. 회의실 쪽에는 오래 머물지 않았습니다.",
    alibi:
      "본인 좌석과 소회의실을 오가며 신규 사업 TF 자료를 정리하고 있었다고 진술. 늦은 시간까지 사무실에 남아 있었던 것은 확인된다.",
    firstImpression:
      "말투는 차분하지만, 답변이 지나치게 정리되어 있다. 미리 준비한 듯한 인상을 준다.",
    policeNotes:
      "피해자와 업무적으로 가장 가까운 위치에 있었으며, 사건 당일 늦은 시간까지 사무실에 남아 있었다.",
    interviewPrompt:
      "피해자와 마지막으로 대화한 시점, 야근 중 동선, 신규 사업 TF 관련 업무를 확인하세요.",
    contradictionHint:
      "진술이 지나치게 매끄럽습니다. 시간대별 동선을 다른 증거와 비교해보세요.",
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
      "회의가 끝난 뒤 바로 정리하고 나왔습니다. 한 팀장님과 의견 차이는 있었지만, 그건 업무적인 문제였습니다.",
    alibi:
      "회의 종료 후 자기 자리로 돌아가 업무를 마무리하고 퇴근했다고 진술. 회의실을 나선 정확한 시점은 본인도 명확히 기억하지 못한다.",
    firstImpression:
      "침착하지만 방어적이다. 질문이 프로젝트 이야기로 넘어가면 목소리가 약간 날카로워진다.",
    policeNotes:
      "사건 당일 피해자와 공개적인 언쟁이 있었다는 직원 진술이 있다.",
    interviewPrompt:
      "회의 종료 후 동선, 피해자와의 언쟁, 프로젝트 일정 갈등을 확인하세요.",
    contradictionHint:
      "업무 갈등을 축소하려는 태도가 보입니다. 회의 이후 실제 동선을 확인해야 합니다.",
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
      "그 시간엔 잠깐 자리를 비웠습니다. 커피를 마시러 갔던 것 같고… 정확한 시간은 잘 기억나지 않습니다.",
    alibi:
      "잠깐 자리에서 벗어나 있었다고만 진술. 이동 경로와 시각을 명확히 특정하지 못한다.",
    firstImpression:
      "대답이 빠르지만 눈을 자주 피한다. 질문을 오래 이어가면 불안한 기색이 드러난다.",
    policeNotes:
      "사건 전후 동선이 가장 불명확하다. 본인은 단순한 휴식이었다고 주장한다.",
    interviewPrompt:
      "커피를 마시러 간 시간, 복도 이동, 피해자와의 마지막 접촉 여부를 확인하세요.",
    contradictionHint:
      "기억이 흐릿하다는 말이 반복됩니다. CCTV와 출입 기록이 확보되면 비교가 필요합니다.",
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
      "저는 인사 관련 자료 때문에 잠깐 이야기를 나눴을 뿐입니다. 사건과 관련될 만한 내용은 아니었습니다.",
    alibi:
      "인사팀 사무실에서 관련 서류를 정리하고 있었다고 진술. 피해자와의 비공개 면담 시각은 기록으로 일부 확인된다.",
    firstImpression:
      "조사에 협조적이지만 긴장한 기색을 감추지 못한다. 질문을 받을 때 손을 자주 만진다.",
    policeNotes:
      "피해자의 최근 업무 중 인사평가 검토가 포함되어 있었고, 한유리는 해당 자료 접근 권한을 가진 직원이다.",
    interviewPrompt:
      "인사평가 자료, 비공개 면담 내용, 사건 당일 피해자와의 대화 여부를 확인하세요.",
    contradictionHint:
      "'관련될 만한 내용은 아니다'라는 표현이 애매합니다. 무엇을 관련 없다고 판단했는지 확인해야 합니다.",
  },
];
