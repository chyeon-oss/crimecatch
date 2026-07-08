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
};

export const suspects: PublicSuspect[] = [
  {
    id: "s1",
    name: "박민수",
    age: 38,
    occupation: "개발1팀 부팀장",
    relationship:
      "피해자와 같은 팀에서 3년간 함께 일한 직속 부하. 결제 플랫폼 리뉴얼 프로젝트를 실무 리드로 함께 이끌었다.",
    personality:
      "말수가 적고 감정을 잘 드러내지 않는 편. 회의에서는 논리적이고 침착한 어조를 유지하지만, 문장 끝을 흐리며 상대의 반응을 살피는 습관이 있다.",
    initialStatement:
      "그 시간엔 저 혼자 소회의실에서 다음 주 스프린트 리뷰 자료를 정리하고 있었습니다. 팀장님 사무실 쪽은 지나가지도 않았어요.",
    alibi:
      "20시경부터 12층 소회의실 B에서 스프린트 리뷰 자료를 작성 중이었다고 진술. 회의실 예약 시스템에는 22시까지 본인 이름으로 예약이 잡혀 있음.",
    firstImpression:
      "지나치게 침착하다. 질문 하나하나에 답하기 전 짧게 숨을 고른다.",
    policeNotes:
      "왼손 손등에 최근 생긴 것으로 보이는 찰과상. 본인은 며칠 전 자전거 낙상 때문이라고 진술.",
  },
  {
    id: "s2",
    name: "이서연",
    age: 31,
    occupation: "프로덕트 기획팀 시니어 매니저",
    relationship:
      "피해자와 결제 플랫폼 리뉴얼 프로젝트를 함께 담당한 기획 파트너. 사건 당일 오후 스펙 변경 건으로 팀장실에서 큰 소리로 말다툼이 있었다는 목격 진술이 다수 확보되었다.",
    personality:
      "감정을 숨기지 않는 직설적인 화법. 말이 빠르고 손짓이 많으며, 자신이 맞다고 생각하는 지점에서는 상대의 말을 끊는 경향이 있다.",
    initialStatement:
      "낮에 다툰 건 인정해요. 그렇다고 사람을 어떻게 해요? 저는 그 시간에 탕비실에서 커피 내리고 있었어요. 필요하면 카드 로그 확인하세요.",
    alibi:
      "20시 10분경부터 12층 탕비실에서 캡슐 커피 머신을 사용했다고 진술. 탕비실 입구 CCTV에 진입 장면이 남아 있다.",
    firstImpression:
      "낮의 다툼을 먼저 인정한다. 방어적이지만 회피하지는 않는다.",
    policeNotes:
      "탕비실 CCTV 진입은 확인되나 재퇴장 시각과 진술 사이에 몇 분의 공백이 있다.",
  },
  {
    id: "s3",
    name: "최지훈",
    age: 29,
    occupation: "개발1팀 시니어 백엔드 개발자",
    relationship:
      "피해자의 팀원. 사건 당일 오후 코드 리뷰 자리에서 피해자에게 공개적으로 강한 질책을 받았다는 진술이 있다.",
    personality:
      "조용하고 시선을 잘 마주치지 않는 편. 질문을 받으면 대답 전에 짧게 숨을 고르고, 대화 중 손을 자주 마주 잡는다.",
    initialStatement:
      "저는 그냥 제 자리에서 리뷰 코멘트 정리하고 있었어요. 이어폰 끼고 있어서 밖에서 무슨 일이 있었는지도 몰랐고요.",
    alibi:
      "본인 좌석(개발1팀 창가 라인)에서 코드 리뷰 코멘트를 작성 중이었다고 진술. 사내 저장소에 20시 12분과 20시 41분에 커밋이 남아 있다.",
    firstImpression:
      "말수가 적고 시선을 피한다. 감정보다 사실 위주로 답한다.",
    policeNotes:
      "사내 저장소 커밋 타임스탬프가 알리바이와 부합. 좌석은 팀장실에서 도보 20초 거리.",
  },
  {
    id: "s4",
    name: "한유리",
    age: 35,
    occupation: "인사팀장",
    relationship:
      "이번 상반기 개발본부 인사평가 실무를 총괄. 피해자와는 승진·평가 관련 회의로 최근 두 달간 접촉이 잦았다.",
    personality:
      "표정 변화가 적고 문장이 짧다. 사실관계만 답하는 원칙주의적 화법을 유지하며, 감정적인 질문에는 대답을 피하는 편.",
    initialStatement:
      "저는 15층 인사팀 사무실에 있었습니다. 결재 대기 중인 서류가 많아 야근하고 있었어요. 그 시간에 12층에 올라갈 이유가 없습니다.",
    alibi:
      "15층 인사팀 사무실에서 상반기 승진 대상자 서류를 정리하고 있었다고 진술. 인사팀 공용 프린터 로그에 20시 22분 출력 기록이 있음.",
    firstImpression:
      "감정적 반응이 거의 없다. 질문의 범위를 벗어난 답변은 하지 않는다.",
    policeNotes:
      "인사팀 프린터 로그로 15층 재실 시점 일부 확인. 12층 접근 여부는 별도 확인 필요.",
  },
];
