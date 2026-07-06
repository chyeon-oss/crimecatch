export type CaseStatus = "무료" | "신규" | "프리미엄";
export type Difficulty = "쉬움" | "보통" | "어려움";

export interface Suspect {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relation: string;
  alibi: string;
  portrait?: string;
}

export interface Evidence {
  id: string;
  name: string;
  description: string;
  location: string;
}

export interface CaseData {
  id: string;
  title: string;
  status: CaseStatus;
  difficulty: Difficulty;
  playTime: string;
  shortDescription: string;
  overview: string;
  victim: {
    name: string;
    age: number;
    occupation: string;
  };
  incidentTime: string;
  incidentLocation: string;
  suspects: Suspect[];
  evidence: Evidence[];
}

export const CASES: CaseData[] = [
  {
    id: "midnight-office",
    title: "한밤의 사무실 살인사건",
    status: "무료",
    difficulty: "보통",
    playTime: "약 30분",
    shortDescription:
      "야근 중이던 팀장이 잠긴 사무실에서 숨진 채 발견되었다. 목격자는 없다.",
    overview:
      "서울 강남의 한 IT 기업. 자정 무렵, 야근 중이던 팀장 김도현이 자신의 사무실에서 둔기에 맞아 사망한 채 발견되었다. 사무실 문은 안쪽에서 잠겨 있었고, CCTV는 사건 직전 30분간 원인 모를 정전으로 꺼져 있었다.",
    victim: { name: "김도현", age: 42, occupation: "개발팀장" },
    incidentTime: "2025년 3월 14일 오후 11시 50분경",
    incidentLocation: "서울 강남구 스카이빌딩 12층 개발팀 사무실",
    suspects: [
      {
        id: "s1",
        name: "이서연",
        age: 29,
        occupation: "동료 개발자",
        relation: "피해자와 최근 프로젝트 갈등",
        alibi: "탕비실에서 커피를 내리고 있었다고 진술",
      },
      {
        id: "s2",
        name: "박준영",
        age: 35,
        occupation: "부팀장",
        relation: "승진 경쟁 관계",
        alibi: "회의실에서 혼자 보고서를 작성 중이었다고 진술",
      },
      {
        id: "s3",
        name: "최민호",
        age: 24,
        occupation: "야간 경비원",
        relation: "사건 당시 12층 순찰 담당",
        alibi: "1층 경비실에 있었다고 진술",
      },
    ],
    evidence: [
      { id: "e1", name: "부러진 만년필", description: "피해자 책상 아래 떨어져 있음", location: "책상 아래" },
      { id: "e2", name: "젖은 우산", description: "그날 비는 오지 않았다", location: "출입문 옆" },
      { id: "e3", name: "삭제된 메시지 로그", description: "사건 직전 피해자와 나눈 대화 흔적", location: "피해자 노트북" },
    ],
  },
  {
    id: "inheritance-party",
    title: "상속 파티의 비밀",
    status: "신규",
    difficulty: "어려움",
    playTime: "약 45분",
    shortDescription:
      "재벌 회장의 유언장 공개 파티에서 상속인이 독살되었다. 용의자는 가족 전원.",
    overview:
      "한강뷰 고급 저택에서 열린 유언장 공개 파티. 유일한 상속인으로 지목된 장남이 축배를 든 직후 쓰러져 사망했다. 잔에서는 청산가리가 검출되었고, 그날 저택에 있던 이들은 모두 가족뿐이었다.",
    victim: { name: "한재훈", age: 38, occupation: "장남·유일 상속인" },
    incidentTime: "2025년 2월 8일 오후 9시 20분경",
    incidentLocation: "성북동 한 회장 자택 대응접실",
    suspects: [
      { id: "s1", name: "한지원", age: 34, occupation: "차녀", relation: "상속에서 배제됨", alibi: "2층 서재에 있었다고 진술" },
      { id: "s2", name: "윤미란", age: 58, occupation: "계모", relation: "피해자와 오랜 갈등", alibi: "주방에서 집사와 대화 중" },
      { id: "s3", name: "한성준", age: 31, occupation: "삼남", relation: "사업 자금 요청 거절당함", alibi: "정원에서 담배를 피우고 있었다고 진술" },
    ],
    evidence: [
      { id: "e1", name: "빈 약병", description: "라벨이 뜯긴 갈색 약병", location: "1층 화장실 쓰레기통" },
      { id: "e2", name: "찢어진 유언장 사본", description: "일부만 남아 있음", location: "벽난로 재 속" },
      { id: "e3", name: "낯선 지문", description: "피해자의 잔에서 검출", location: "와인 잔" },
    ],
  },
  {
    id: "missing-trainee",
    title: "사라진 아이돌 연습생",
    status: "프리미엄",
    difficulty: "어려움",
    playTime: "약 60분",
    shortDescription:
      "데뷔를 일주일 앞둔 연습생이 숙소에서 흔적도 없이 사라졌다.",
    overview:
      "대형 기획사의 톱 데뷔조 멤버였던 연습생 서유나가 데뷔 쇼케이스를 일주일 앞두고 숙소에서 사라졌다. 개인 소지품은 그대로였고, 방문은 안에서 잠겨 있었다. 회사는 사건을 은폐하려 하고 있다.",
    victim: { name: "서유나", age: 19, occupation: "아이돌 연습생" },
    incidentTime: "2025년 5월 1일 새벽 3시경 추정",
    incidentLocation: "서울 마포구 기획사 여자 연습생 숙소 302호",
    suspects: [
      { id: "s1", name: "정하늘", age: 20, occupation: "같은 팀 연습생", relation: "센터 자리 경쟁", alibi: "옆방에서 자고 있었다고 진술" },
      { id: "s2", name: "강대표", age: 47, occupation: "기획사 대표", relation: "계약 갈등", alibi: "사건 당시 해외 출장 중이라 주장" },
      { id: "s3", name: "이매니저", age: 33, occupation: "담당 매니저", relation: "숙소 마스터키 소지자", alibi: "회사 사무실에서 야근 중이었다고 진술" },
    ],
    evidence: [
      { id: "e1", name: "부러진 손톱", description: "창문 프레임에서 발견", location: "302호 창가" },
      { id: "e2", name: "삭제된 SNS 초안", description: "폭로글로 추정되는 내용", location: "피해자 휴대폰 백업" },
      { id: "e3", name: "낯선 차량 블랙박스", description: "새벽 3시경 숙소 앞 정차 기록", location: "숙소 앞 도로" },
    ],
  },
];

export function getCaseById(id: string): CaseData | undefined {
  return CASES.find((c) => c.id === id);
}
