import type { CaseInterviewPack } from "@/types/interview";

/**
 * CASE002 suspect interviews — authored, player-facing only.
 *
 * Rules for this file:
 *  - Built exclusively on the PUBLIC suspect profiles and the PUBLIC evidence
 *    ids of this case. It must never import (or paraphrase) _spoilers.ts,
 *    _truth.ts, or AUTHOR_BIBLE.md.
 *  - Every family member is hiding something real — a lie, a secret, a money
 *    motive. None of these answers concludes who the killer is.
 *  - Moods (calm / guarded / shaken) are psychological readings, never
 *    verdicts of guilt.
 *  - Each suspect has at least one evidence-triggered contradiction and one
 *    PRESSURE follow-up unlocked by it.
 */
export const inheritancePartyInterviews: CaseInterviewPack = {
  caseId: "inheritance-party",
  speakers: [
    { id: "me", name: "나", role: "DETECTIVE" },
    { id: "s1", name: "한지원", role: "WITNESS", title: "브랜드전략팀 이사 · 여동생" },
    { id: "s2", name: "윤미란", role: "WITNESS", title: "가족재단 상임이사 · 계모" },
    { id: "s3", name: "한성준", role: "WITNESS", title: "전 스타트업 대표 · 남동생" },
    { id: "s4", name: "한서연", role: "WITNESS", title: "변호사 · 배우자" },
  ],
  suspects: [
    // ------------------------------------------------------------------ s1
    {
      suspectId: "s1",
      speakerId: "s1",
      requiredTopicIds: ["s1-t-exclusion", "s1-t-study", "s1-t-draft"],
      topics: [
        {
          id: "s1-t-exclusion",
          label: "상속에서 제외된 사실은 언제 알았습니까?",
          lines: [
            { id: "l1", speakerId: "s1", text: "낭독 때 알았습니다. 그 자리에서요." },
            {
              id: "l2",
              speakerId: "s1",
              text: "놀라긴 했지만, 오빠 재산입니다. 제가 뭐라 할 문제는 아니죠.",
            },
          ],
          note: "한지원 — 배제 사실을 낭독 자리에서 처음 알았다고 주장.",
          choices: [
            {
              id: "c-quote",
              text: "그런데 조항 문구를 정확히 인용하시더군요.",
              reply: [
                { id: "r1", speakerId: "s1", text: "…한 번 들으면 기억하는 편입니다." },
                {
                  id: "r2",
                  speakerId: "s1",
                  text: "직업이 그렇습니다. 계약 문구를 외우는 일이요.",
                },
              ],
              mood: "guarded",
              note: "조항 문구 암기 지적에 방어적으로 반응.",
            },
            {
              id: "c-calm",
              text: "감정적으로는 어떠셨습니까?",
              reply: [
                { id: "r1", speakerId: "s1", text: "화가 났습니다. 솔직히 말하죠." },
                {
                  id: "r2",
                  speakerId: "s1",
                  text: "그렇다고 제가 오빠 잔에 뭘 넣을 사람으로 보입니까.",
                },
              ],
              note: "배제에 대한 분노를 인정. 다만 관여는 강하게 부인.",
            },
          ],
        },
        {
          id: "s1-t-study",
          label: "낭독 전에 2층 서재에 올라간 적이 있습니까?",
          lines: [
            { id: "l1", speakerId: "s1", text: "아니요. 서재에는 들어가지 않았습니다." },
            { id: "l2", speakerId: "me", text: "한 번도?" },
            { id: "l3", speakerId: "s1", text: "예. 저는 응접실과 제 방만 오갔습니다." },
          ],
          mood: "calm",
          note: "낭독 전후 서재 출입을 전면 부인.",
        },
        {
          id: "s1-t-draft",
          label: "벽난로는 그날 왜 켜져 있었습니까?",
          lines: [
            { id: "l1", speakerId: "s1", text: "원래 겨울엔 늘 켭니다. 가사 인력이 관리해요." },
            {
              id: "l2",
              speakerId: "s1",
              text: "제가 손댄 적은 없습니다. 근처에 서 있긴 했지만요.",
            },
          ],
          note: "벽난로는 상시 가동이며 본인은 손대지 않았다고 진술.",
          choices: [
            {
              id: "c-near",
              text: "근처에 얼마나 오래 서 계셨습니까?",
              reply: [
                { id: "r1", speakerId: "s1", text: "몇 분요. 추워서 서 있었던 겁니다." },
                { id: "r2", speakerId: "s1", text: "그게 문제가 됩니까?" },
              ],
              mood: "guarded",
              note: "벽난로 앞 체류 시간을 '몇 분'으로 축소해 진술.",
            },
            {
              id: "c-paper",
              text: "그 자리에서 종이 타는 냄새를 맡지 못했습니까?",
              reply: [
                { id: "r1", speakerId: "s1", text: "…장작 냄새와 구분이 되겠습니까." },
                { id: "r2", speakerId: "s1", text: "저는 모르겠습니다." },
              ],
              note: "종이 연소 여부에 대해 판단을 회피.",
            },
          ],
        },
        {
          id: "s1-t-press-burn",
          label: "초안을 복사한 뒤 태운 이유를 말씀하십시오.",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s1", text: "…" },
            {
              id: "l2",
              speakerId: "s1",
              text: "낭독 두 시간 전에 서재에서 초안을 봤습니다. 사진을 찍었고, 출력본은 태웠습니다.",
            },
            {
              id: "l3",
              speakerId: "me",
              text: "왜 태웠습니까?",
            },
            {
              id: "l4",
              speakerId: "s1",
              text: "제가 미리 봤다는 사실 자체가 문제가 될 테니까요. 소송을 준비할 생각이었습니다.",
            },
            {
              id: "l5",
              speakerId: "s1",
              text: "20시 50분쯤입니다. 그 뒤로는 응접실을 떠나지 않았습니다. 문서는 태웠지만 오빠를 해치진 않았습니다.",
            },
          ],
          mood: "shaken",
          note: "20:50경 서재 초안 열람·촬영·소각을 인정. 목적은 상속 소송 준비라고 진술.",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e5"],
          lines: [
            { id: "x1", speakerId: "s1", text: "…그 조각이 남아 있었습니까." },
            {
              id: "x2",
              speakerId: "me",
              text: "서재 프린터 용지입니다. 그리고 서재에는 들어가지 않으셨다고 했습니다.",
            },
            { id: "x3", speakerId: "s1", text: "제가… 말씀드릴 게 있습니다." },
          ],
          mood: "shaken",
          note: "소각된 초안 조각 제시 후 서재 진술이 흔들림.",
          contradiction: {
            id: "s1-c-study",
            title: "서재에 가지 않았다는 진술과 초안 조각",
            detail:
              "한지원은 서재 출입을 전면 부인했지만, 벽난로에서 나온 초안 조각의 용지는 서재 프린터의 것이다. 낭독 이전에 문서를 본 사람이 있다.",
            unlocksTopicIds: ["s1-t-press-burn"],
          },
        },
        {
          evidenceIds: ["e9"],
          lines: [
            { id: "y1", speakerId: "s1", text: "오빠가 재단 감사를 요청하려 했다고요?" },
            {
              id: "y2",
              speakerId: "s1",
              text: "저는 재단 일에 관여한 적이 없습니다. 그건 미란 씨 영역입니다.",
            },
          ],
          mood: "guarded",
          note: "재단 감사 초안에 대해 관여를 부인하며 계모 쪽을 지목.",
        },
      ],
      genericReaction: [
        { id: "g1", speakerId: "s1", text: "그건 제가 판단할 수 있는 자료가 아닙니다." },
      ],
    },

    // ------------------------------------------------------------------ s2
    {
      suspectId: "s2",
      speakerId: "s2",
      requiredTopicIds: ["s2-t-after-toast", "s2-t-pantry", "s2-t-foundation"],
      topics: [
        {
          id: "s2-t-after-toast",
          label: "축배 이후 어디에 계셨습니까?",
          lines: [
            { id: "l1", speakerId: "s2", text: "조리실입니다. 만찬 접시를 확인하고 있었어요." },
            {
              id: "l2",
              speakerId: "s2",
              text: "재훈이가 쓰러졌다는 소리를 듣고 바로 문 앞으로 나왔습니다.",
            },
          ],
          note: "윤미란 — 축배 이후 조리실에 계속 있었다고 진술.",
          choices: [
            {
              id: "c-witness",
              text: "조리실에 함께 있던 사람이 있습니까?",
              reply: [
                { id: "r1", speakerId: "s2", text: "가사 인력이 오갔습니다. 계속은 아니었고요." },
                { id: "r2", speakerId: "s2", text: "제가 혼자 있던 시간도 있었을 겁니다." },
              ],
              note: "조리실 단독 체류 구간이 있었음을 인정.",
            },
            {
              id: "c-precise",
              text: "시각을 굉장히 정확하게 말씀하시는군요.",
              reply: [
                { id: "r1", speakerId: "s2", text: "행사 진행표가 있었으니까요." },
                {
                  id: "r2",
                  speakerId: "s2",
                  text: "저는 6년간 이 집의 일정을 관리했습니다. 그게 이상한 일입니까?",
                },
              ],
              mood: "guarded",
              note: "정확한 시각 진술의 근거를 행사 진행표로 설명.",
            },
          ],
        },
        {
          id: "s2-t-pantry",
          label: "팬트리에는 들어가셨습니까?",
          lines: [
            { id: "l1", speakerId: "s2", text: "아니요. 그날은 들어갈 일이 없었습니다." },
            {
              id: "l2",
              speakerId: "s2",
              text: "벌꿀 시럽은 재훈이가 직접 챙기던 겁니다. 저는 손대지 않습니다.",
            },
          ],
          note: "팬트리 출입과 점적기 접촉을 모두 부인.",
        },
        {
          id: "s2-t-foundation",
          label: "재단 집행 내역 재검토 이야기는 알고 계셨습니까?",
          lines: [
            { id: "l1", speakerId: "s2", text: "재훈이가 '발표할 것이 있다'고만 했습니다." },
            { id: "l2", speakerId: "s2", text: "내용은 몰랐습니다." },
          ],
          mood: "guarded",
          note: "발표 예고는 알았으나 내용은 몰랐다고 진술.",
          choices: [
            {
              id: "c-audit",
              text: "재단 회계는 누가 확인합니까?",
              reply: [
                { id: "r1", speakerId: "s2", text: "제가 합니다. 6년째요." },
                {
                  id: "r2",
                  speakerId: "s2",
                  text: "외부 감사를 받은 적은 없습니다. 필요가 없었으니까요.",
                },
              ],
              note: "재단 회계를 6년간 단독 관리했고 외부 감사 이력이 없다고 진술.",
            },
            {
              id: "c-soft",
              text: "발표 예고를 들었을 때 어떤 생각이 드셨습니까?",
              reply: [
                { id: "r1", speakerId: "s2", text: "재산 이야기겠거니 했습니다." },
                { id: "r2", speakerId: "s2", text: "그 이상은 생각하지 않았습니다." },
              ],
              note: "발표 예고를 재산 관련으로만 짐작했다고 진술.",
            },
          ],
        },
        {
          id: "s2-t-press-route",
          label: "21시 07분부터 14분까지, 다시 말씀해 주십시오.",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s2", text: "…" },
            {
              id: "l2",
              speakerId: "s2",
              text: "팬트리에 들어갔습니다. 조리실에만 있었다고 한 건 정확하지 않았습니다.",
            },
            { id: "l3", speakerId: "me", text: "무엇을 하러 갔습니까?" },
            {
              id: "l4",
              speakerId: "s2",
              text: "선반을 정리했습니다. 그게 전부입니다.",
            },
            {
              id: "l5",
              speakerId: "s2",
              text: "감사 이야기와 이 질문을 붙이시는 거라면, 그건 형사님 추측입니다.",
            },
          ],
          mood: "shaken",
          note: "압박 후 21:07~21:14 팬트리 진입을 인정. 목적은 '선반 정리'라고만 진술.",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e8"],
          lines: [
            { id: "x1", speakerId: "s2", text: "출입 기록이 남는 줄은… 알고 있었습니다." },
            {
              id: "x2",
              speakerId: "me",
              text: "팬트리 구역 21시 07분 점등, 진입 기록 1건입니다. 조리실 문은 닫혀 있었습니다.",
            },
            { id: "x3", speakerId: "s2", text: "…" },
          ],
          mood: "shaken",
          note: "팬트리 접근 기록과 본인 동선 진술이 충돌.",
          contradiction: {
            id: "s2-c-pantry",
            title: "조리실 진술과 팬트리 접근 기록",
            detail:
              "윤미란은 축배 이후 조리실에 있었고 팬트리에는 들어가지 않았다고 했지만, 21:07~21:14 팬트리 구역 진입 기록이 남아 있다.",
            unlocksTopicIds: ["s2-t-press-route"],
          },
        },
        {
          evidenceIds: ["e3"],
          lines: [
            { id: "y1", speakerId: "s2", text: "점적기요. 재훈이 물건입니다." },
            {
              id: "y2",
              speakerId: "s2",
              text: "병 목이 깨끗하다는 게 무슨 의미인지는 모르겠군요.",
            },
          ],
          mood: "guarded",
          note: "점적기를 피해자 전용 물품으로 규정하며 거리 두기.",
        },
        {
          evidenceIds: ["e9"],
          lines: [
            { id: "z1", speakerId: "s2", text: "3개년 전수 검토라고요?" },
            {
              id: "z2",
              speakerId: "s2",
              text: "재단 집행은 전부 이사회 결의를 거쳤습니다. 감사가 무서울 이유는 없습니다.",
            },
            { id: "z3", speakerId: "me", text: "그런데 목소리가 낮아지셨습니다." },
          ],
          mood: "shaken",
          note: "외부 감사 초안 제시에 방어적으로 반응. 감사 자체는 문제없다고 주장.",
        },
      ],
      genericReaction: [
        { id: "g1", speakerId: "s2", text: "그 자료는 제 소관이 아닙니다." },
        { id: "g2", speakerId: "s2", text: "필요하시면 재단 사무국에 요청하십시오." },
      ],
    },

    // ------------------------------------------------------------------ s3
    {
      suspectId: "s3",
      speakerId: "s3",
      requiredTopicIds: ["s3-t-debt", "s3-t-barcart", "s3-t-phone"],
      topics: [
        {
          id: "s3-t-debt",
          label: "형에게 자금 지원을 요청했다고 들었습니다.",
          lines: [
            { id: "l1", speakerId: "s3", text: "했습니다. 거절당했고요." },
            { id: "l2", speakerId: "s3", text: "그 얘기 하려고 여기까지 부르신 겁니까?" },
          ],
          mood: "guarded",
          note: "한성준 — 자금 지원 요청과 거절 사실을 인정.",
          choices: [
            {
              id: "c-amount",
              text: "채무 규모가 얼마입니까?",
              reply: [
                { id: "r1", speakerId: "s3", text: "…몇 억 정도요." },
                { id: "r2", speakerId: "me", text: "정확히 말씀하십시오." },
                { id: "r3", speakerId: "s3", text: "사채까지 합치면 더 됩니다. 그건 인정합니다." },
              ],
              mood: "shaken",
              note: "채무 규모를 처음에 축소했다가 사채 포함을 인정.",
            },
            {
              id: "c-relation",
              text: "거절당한 뒤 형과 사이는 어땠습니까?",
              reply: [
                { id: "r1", speakerId: "s3", text: "말을 거의 안 했습니다." },
                { id: "r2", speakerId: "s3", text: "그래도 형이었습니다. 그건 진심입니다." },
              ],
              note: "거절 이후 관계 단절 상태였다고 진술.",
            },
          ],
        },
        {
          id: "s3-t-barcart",
          label: "바 카트 근처에는 왜 계셨습니까?",
          lines: [
            { id: "l1", speakerId: "s3", text: "술을 따르러 갔습니다. 그게 이상합니까?" },
            { id: "l2", speakerId: "s3", text: "저는 대부분 테라스에 있었습니다. 담배 때문에요." },
          ],
          note: "바 카트 접근은 음주 목적이었고 대부분 테라스에 있었다고 진술.",
        },
        {
          id: "s3-t-phone",
          label: "형의 휴대전화를 만진 적이 있습니까?",
          lines: [
            { id: "l1", speakerId: "s3", text: "없습니다. 절대로요." },
            { id: "l2", speakerId: "s3", text: "쓰러진 사람 물건을 왜 만집니까." },
          ],
          mood: "guarded",
          note: "피해자 휴대전화 접촉을 전면 부인.",
          choices: [
            {
              id: "c-again",
              text: "사망 확인 이후에도 말입니까?",
              reply: [
                { id: "r1", speakerId: "s3", text: "…예. 없습니다." },
                { id: "r2", speakerId: "s3", text: "왜 자꾸 그걸 물으십니까." },
              ],
              mood: "guarded",
              note: "사망 이후 접촉도 재차 부인. 질문 자체에 예민하게 반응.",
            },
            {
              id: "c-cuff",
              text: "셔츠 왼쪽 커프스가 비어 있군요.",
              reply: [
                { id: "r1", speakerId: "s3", text: "…잃어버렸습니다. 오늘 아침에요." },
                { id: "r2", speakerId: "s3", text: "그게 사건과 무슨 상관입니까." },
              ],
              mood: "shaken",
              note: "빈 커프스에 대해 '오늘 아침 분실'이라고 답변.",
            },
          ],
        },
        {
          id: "s3-t-press-phone",
          label: "21시 26분에서 39분 사이, 무엇을 지웠습니까?",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s3", text: "…" },
            {
              id: "l2",
              speakerId: "s3",
              text: "제가 가져갔습니다. 복도로요. 형 휴대전화 맞습니다.",
            },
            { id: "l3", speakerId: "me", text: "이유는." },
            {
              id: "l4",
              speakerId: "s3",
              text: "돈 갚으라고 보낸 메시지가 있었습니다. 그게 남으면 제가 제일 먼저 의심받으니까요.",
            },
            {
              id: "l5",
              speakerId: "s3",
              text: "형은 이미 쓰러진 뒤였습니다. 저는 메시지를 지웠지 사람을 죽이지 않았습니다.",
            },
          ],
          mood: "shaken",
          note: "21:26~21:39 휴대전화 반출과 채무 메시지 삭제를 인정. 시점은 사망 이후.",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e6"],
          lines: [
            { id: "x1", speakerId: "s3", text: "이동 기록이라니… 그런 것도 남습니까?" },
            {
              id: "x2",
              speakerId: "me",
              text: "21시 26분에서 39분, 복도 쪽으로 나갔다가 돌아왔습니다. 같은 시간에 메시지 1건이 삭제됐습니다.",
            },
            { id: "x3", speakerId: "s3", text: "…" },
          ],
          mood: "shaken",
          note: "휴대전화 이동·삭제 기록과 '만진 적 없다'는 진술이 충돌.",
          contradiction: {
            id: "s3-c-phone",
            title: "휴대전화를 만지지 않았다는 진술과 삭제 기록",
            detail:
              "한성준은 피해자의 휴대전화에 손대지 않았다고 했지만, 사망 이후 21:26~21:39 사이 기기가 복도로 이동했고 채무 관련 메시지가 삭제됐다. 이 시간대는 독이 전달된 시간대와 다르다.",
            unlocksTopicIds: ["s3-t-press-phone"],
          },
        },
        {
          evidenceIds: ["e10"],
          lines: [
            { id: "y1", speakerId: "s3", text: "그건… 제 겁니다." },
            {
              id: "y2",
              speakerId: "s3",
              text: "바 카트 아래에 있었다면 제가 몸을 숙였다는 뜻이겠죠. 부정하지 않겠습니다.",
            },
          ],
          mood: "shaken",
          note: "바 카트 아래 커프스단추를 본인 것으로 인정.",
        },
        {
          evidenceIds: ["e2"],
          lines: [
            { id: "z1", speakerId: "s3", text: "형 전용 잔입니다. 아무도 안 씁니다." },
            { id: "z2", speakerId: "s3", text: "저는 그 잔에 손댄 적 없습니다." },
          ],
          mood: "guarded",
          note: "피해자 전용 위스키 잔 접촉은 부인.",
        },
      ],
      genericReaction: [{ id: "g1", speakerId: "s3", text: "그건 제가 모르는 얘기입니다." }],
    },

    // ------------------------------------------------------------------ s4
    {
      suspectId: "s4",
      speakerId: "s4",
      requiredTopicIds: ["s4-t-marriage", "s4-t-docs", "s4-t-finance"],
      topics: [
        {
          id: "s4-t-marriage",
          label: "부부 관계는 어떠셨습니까?",
          lines: [
            { id: "l1", speakerId: "s4", text: "평범했습니다. 9년 살았으니까요." },
            { id: "l2", speakerId: "s4", text: "특별히 문제될 것은 없었습니다." },
          ],
          mood: "calm",
          note: "한서연 — 부부 관계에 문제가 없었다고 진술.",
          choices: [
            {
              id: "c-rumor",
              text: "가족 내에 별거 이야기가 돌았습니다.",
              reply: [
                { id: "r1", speakerId: "s4", text: "소문은 소문입니다, 형사님." },
                { id: "r2", speakerId: "s4", text: "추측을 사실처럼 다루지 않으셨으면 합니다." },
              ],
              mood: "guarded",
              note: "별거 소문을 추측으로 일축.",
            },
            {
              id: "c-lawyer",
              text: "변호사시죠. 진술의 무게를 아실 겁니다.",
              reply: [
                { id: "r1", speakerId: "s4", text: "압니다. 그래서 말을 고르는 겁니다." },
                { id: "r2", speakerId: "s4", text: "질문 범위를 정확히 주시면 정확히 답하겠습니다." },
              ],
              note: "직업적 화법으로 질문 범위를 제한하려 함.",
            },
          ],
        },
        {
          id: "s4-t-docs",
          label: "혼전계약과 관련한 분쟁이 있었습니까?",
          lines: [
            { id: "l1", speakerId: "s4", text: "…협의 중이었습니다." },
            { id: "l2", speakerId: "s4", text: "분쟁이라고 부를 단계는 아니었습니다." },
          ],
          mood: "guarded",
          note: "혼전계약 관련 '협의 중'이었다고 진술 수정.",
        },
        {
          id: "s4-t-finance",
          label: "사건 전후로 재산 관련 문서를 열람하셨습니까?",
          lines: [
            { id: "l1", speakerId: "s4", text: "예. 열람했습니다. 숨길 생각 없습니다." },
            { id: "l2", speakerId: "s4", text: "제 몫이 어떻게 되는지 확인할 필요가 있었습니다." },
          ],
          note: "재산 문서 사전 열람 사실을 인정.",
          choices: [
            {
              id: "c-when",
              text: "언제 열람하셨습니까?",
              reply: [
                { id: "r1", speakerId: "s4", text: "사건 2주 전쯤부터입니다." },
                { id: "r2", speakerId: "s4", text: "낭독 당일에는 열지 않았습니다." },
              ],
              note: "열람 시점을 사건 2주 전부터라고 진술. 당일 열람은 부인.",
            },
            {
              id: "c-why",
              text: "무엇을 확인하려 하셨습니까?",
              reply: [
                { id: "r1", speakerId: "s4", text: "혼전계약이 유효한 범위요." },
                {
                  id: "r2",
                  speakerId: "s4",
                  text: "솔직히 말씀드리면, 제게 유리한 결론은 아니었습니다.",
                },
              ],
              mood: "guarded",
              note: "열람 목적은 혼전계약 유효 범위 확인. 결론은 본인에게 불리했다고 진술.",
            },
          ],
        },
        {
          id: "s4-t-press-separation",
          label: "별거 협의 초안은 왜 감추셨습니까?",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s4", text: "…감췄다기보다는, 먼저 말할 이유가 없었습니다." },
            {
              id: "l2",
              speakerId: "s4",
              text: "초안은 사건 11일 전에 작성됐습니다. 제가 준비한 것도 맞습니다.",
            },
            { id: "l3", speakerId: "me", text: "그 문서가 남편의 사망으로 유리해집니까?" },
            {
              id: "l4",
              speakerId: "s4",
              text: "아니요. 반대입니다. 협의가 끝났다면 제가 받을 몫이 더 컸습니다.",
            },
            {
              id: "l5",
              speakerId: "s4",
              text: "저는 결혼을 정리하려던 사람이지, 남편이 죽어서 이득 보는 구조에 있지 않았습니다. 확인해 보십시오.",
            },
          ],
          mood: "shaken",
          note: "별거 협의 초안 은폐를 인정. 사망으로 오히려 불리한 구조라고 주장(검증 필요).",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e7"],
          lines: [
            { id: "x1", speakerId: "s4", text: "그 가방을 여셨군요." },
            {
              id: "x2",
              speakerId: "me",
              text: "별거 협의 초안과 혼전계약 의견서입니다. 문제될 것이 없다고 하셨습니다.",
            },
            { id: "x3", speakerId: "s4", text: "…말을 고르겠습니다." },
          ],
          mood: "shaken",
          note: "별거 서류 제시 후 '문제없다'는 초기 진술이 무너짐.",
          contradiction: {
            id: "s4-c-marriage",
            title: "문제없던 결혼과 별거 협의 초안",
            detail:
              "한서연은 부부 관계에 문제가 없었다고 진술했지만, 사건 11일 전 작성된 별거 협의 초안과 혼전계약 의견서가 그녀의 서류 가방에서 나왔다.",
            unlocksTopicIds: ["s4-t-press-separation"],
          },
        },
        {
          evidenceIds: ["e9"],
          lines: [
            { id: "y1", speakerId: "s4", text: "재단 외부 감사요. 그건 처음 듣습니다." },
            {
              id: "y2",
              speakerId: "s4",
              text: "제가 본 문서는 개인 재산 쪽입니다. 재단 회계는 접근 권한이 없습니다.",
            },
          ],
          mood: "guarded",
          note: "재단 감사 초안은 처음 접했다고 진술. 재단 회계 접근 권한 없음을 강조.",
        },
      ],
      genericReaction: [
        { id: "g1", speakerId: "s4", text: "그 자료에 대해서는 답변하지 않겠습니다." },
        { id: "g2", speakerId: "s4", text: "필요하시면 정식으로 요청해 주십시오." },
      ],
    },
  ],
};
