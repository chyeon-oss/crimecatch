import type { CaseInterviewPack } from "@/types/interview";

/**
 * CASE001 suspect interviews — authored, player-facing only.
 *
 * Rules for this file:
 *  - Built on the public suspect profiles (진술 / 알리바이 / 인터뷰 메모 /
 *    압박 지점 / 모순 힌트). Never imports or reveals hiddenTruth or isCulprit.
 *  - Moods are psychological reactions, never verdicts.
 *  - Every suspect has at least one contradiction and one follow-up
 *    pressure question, so several people can look suspicious at once.
 */
export const midnightOfficeInterviews: CaseInterviewPack = {
  caseId: "midnight-office",
  speakers: [
    { id: "me", name: "나", role: "DETECTIVE" },
    { id: "s1", name: "박민수", role: "WITNESS", title: "기획전략실 대리" },
    { id: "s2", name: "이서연", role: "WITNESS", title: "디자인팀 팀장" },
    { id: "s3", name: "최지훈", role: "WITNESS", title: "개발팀 선임" },
    { id: "s4", name: "한유리", role: "WITNESS", title: "인사팀 과장" },
  ],
  suspects: [
    // ------------------------------------------------------------------ s1
    {
      suspectId: "s1",
      speakerId: "s1",
      requiredTopicIds: ["s1-t-alibi", "s1-t-last", "s1-t-door"],
      topics: [
        {
          id: "s1-t-alibi",
          label: "그 시간에 어디에 있었습니까?",
          lines: [
            { id: "l1", speakerId: "s1", text: "제 자리에 있었습니다. 자료 정리 중이었어요." },
            {
              id: "l2",
              speakerId: "s1",
              text: "22시 넘어서까지요. 정확한 시각은… 화면만 보고 있어서요.",
            },
          ],
          note: "박민수 — 자리에서 야근 중이었다고 주장. 정확한 시각은 기억 못 함.",
          choices: [
            {
              id: "c-press",
              text: "정확한 시각은 왜 기억나지 않습니까?",
              reply: [
                { id: "r1", speakerId: "s1", text: "…시계를 볼 이유가 없었습니다." },
                {
                  id: "r2",
                  speakerId: "s1",
                  text: "그날은 마감 자료가 급했습니다. 그것뿐입니다.",
                },
              ],
              mood: "guarded",
              note: "시각 질문에 방어적으로 반응.",
            },
            {
              id: "c-soft",
              text: "알겠습니다. 자리에서 무엇을 정리했습니까?",
              reply: [
                { id: "r1", speakerId: "s1", text: "TF 예산 자료입니다. 팀장님이 요청하신 겁니다." },
                { id: "r2", speakerId: "s1", text: "제출은 다음 날 아침이었습니다." },
              ],
              note: "TF 예산 자료 정리 중이었다고 진술.",
            },
          ],
        },
        {
          id: "s1-t-last",
          label: "팀장과의 마지막 대화는 언제였습니까?",
          lines: [
            { id: "l1", speakerId: "s1", text: "회의 때가 마지막입니다. 따로 이야기한 건 없어요." },
            { id: "l2", speakerId: "me", text: "회의 이후에는 한 번도?" },
            { id: "l3", speakerId: "s1", text: "예. 한 번도요." },
          ],
          note: "회의 이후 피해자와 접촉이 전혀 없었다고 진술.",
          choices: [
            {
              id: "c-doubt",
              text: "같은 층에 있었는데 한 번도 마주치지 않았습니까?",
              reply: [
                { id: "r1", speakerId: "s1", text: "…복도는 지나갔을 수 있습니다." },
                { id: "r2", speakerId: "s1", text: "하지만 말은 섞지 않았습니다." },
              ],
              mood: "guarded",
              note: "복도에서 지나쳤을 수 있다고 진술을 수정.",
            },
            {
              id: "c-note",
              text: "회의에서 팀장은 어떤 상태였습니까?",
              reply: [
                { id: "r1", speakerId: "s1", text: "예민했습니다. 조직개편 이야기가 나왔으니까요." },
                { id: "r2", speakerId: "s1", text: "저한테만 그런 건 아니었습니다." },
              ],
              note: "회의에서 조직개편 이야기가 있었다고 진술.",
            },
          ],
        },
        {
          id: "s1-t-door",
          label: "기획전략실 출입문은 누가 잠갔습니까?",
          lines: [
            { id: "l1", speakerId: "s1", text: "보통은 마지막에 나가는 사람이 잠급니다." },
            { id: "l2", speakerId: "s1", text: "그날은… 제가 잠근 기억은 없습니다." },
          ],
          note: "출입문을 잠근 기억이 없다고 진술.",
        },
        {
          id: "s1-t-press-time",
          label: "22시 전후 15분, 다시 말해보세요.",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s1", text: "…" },
            {
              id: "l2",
              speakerId: "s1",
              text: "자리에 있었습니다. 다만 프린터 쪽에 한 번 갔던 것 같습니다.",
            },
            {
              id: "l3",
              speakerId: "s1",
              text: "그게 그 시간이었는지는 정말 모르겠습니다.",
            },
          ],
          mood: "shaken",
          note: "압박 후 프린터 쪽으로 자리를 비웠을 수 있다고 진술 변경.",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e4"],
          lines: [
            { id: "x1", speakerId: "s1", text: "문이… 잠겨 있었다고요?" },
            {
              id: "x2",
              speakerId: "s1",
              text: "저는 잠그지 않았습니다. 그럼 제가 나간 뒤 누군가 잠갔다는 얘기인데요.",
            },
            { id: "x3", speakerId: "me", text: "당신은 문을 잠근 기억이 없다고 했습니다." },
          ],
          mood: "guarded",
          note: "잠긴 출입문과 본인 진술이 어긋난다.",
          contradiction: {
            id: "s1-c-door",
            title: "잠긴 문과 잠그지 않았다는 진술",
            detail:
              "박민수는 문을 잠근 기억이 없다고 했지만, 현장 출입문은 닫힌 상태였다. 그가 나간 시각을 다시 확인해야 한다.",
            unlocksTopicIds: ["s1-t-press-time"],
          },
        },
        {
          evidenceIds: ["e7"],
          lines: [
            { id: "y1", speakerId: "s1", text: "회의실 시계가 멈춰 있었습니까?" },
            { id: "y2", speakerId: "s1", text: "…저는 그 방에 들어가지 않았습니다." },
          ],
          mood: "shaken",
          note: "멈춘 시계 언급 후 회의실 출입을 강하게 부정.",
        },
      ],
      genericReaction: [
        { id: "g1", speakerId: "s1", text: "그건 제가 아는 내용이 아닙니다." },
        { id: "g2", speakerId: "s1", text: "필요하면 확인해 보십시오." },
      ],
    },

    // ------------------------------------------------------------------ s2
    {
      suspectId: "s2",
      speakerId: "s2",
      requiredTopicIds: ["s2-t-leave", "s2-t-conflict", "s2-t-route"],
      topics: [
        {
          id: "s2-t-leave",
          label: "회의가 끝난 뒤 바로 나갔습니까?",
          lines: [
            { id: "l1", speakerId: "s2", text: "예. 남아 있을 이유가 없었습니다." },
            { id: "l2", speakerId: "s2", text: "21시 조금 넘어서 나왔습니다." },
          ],
          note: "이서연 — 21시 직후 퇴근했다고 주장.",
        },
        {
          id: "s2-t-conflict",
          label: "팀장과 충돌한 이유가 무엇이었습니까?",
          lines: [
            { id: "l1", speakerId: "s2", text: "일정입니다. 항상 일정이었어요." },
            {
              id: "l2",
              speakerId: "s2",
              text: "품질을 포기하라는 요구를 계속 받았습니다. 감정 문제가 아니라 업무 문제였습니다.",
            },
          ],
          note: "일정·품질 문제로 피해자와 반복 충돌했다고 진술.",
          choices: [
            {
              id: "c-hard",
              text: "그 요구가 상당히 불쾌했겠군요.",
              reply: [
                { id: "r1", speakerId: "s2", text: "불쾌했습니다. 부정하지 않겠습니다." },
                {
                  id: "r2",
                  speakerId: "s2",
                  text: "그렇다고 제가 사람을 해칠 이유가 되진 않습니다.",
                },
              ],
              mood: "guarded",
              note: "감정적 반발을 인정하되 강하게 선을 그음.",
            },
            {
              id: "c-fact",
              text: "그 갈등이 기록으로 남아 있습니까?",
              reply: [
                { id: "r1", speakerId: "s2", text: "회의록에 다 있습니다. 숨길 것도 없어요." },
                { id: "r2", speakerId: "s2", text: "확인해 보시면 됩니다." },
              ],
              note: "갈등 내용이 회의록에 남아 있다고 진술.",
            },
          ],
        },
        {
          id: "s2-t-route",
          label: "나갈 때 어느 동선으로 이동했습니까?",
          lines: [
            { id: "l1", speakerId: "s2", text: "12층 복도, 엘리베이터, 1층 로비입니다." },
            { id: "l2", speakerId: "s2", text: "평소와 같습니다." },
          ],
          note: "12층 복도 → 엘리베이터 → 로비 동선을 주장.",
        },
        {
          id: "s2-t-press-route",
          label: "복도 기록이 비어 있는 이유를 설명해 주십시오.",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s2", text: "제가 카메라를 만졌다는 말씀입니까?" },
            { id: "l2", speakerId: "me", text: "아니요. 왜 기록이 없는지 묻는 겁니다." },
            {
              id: "l3",
              speakerId: "s2",
              text: "…계단을 썼습니다. 엘리베이터가 늦어서. 그 말을 안 한 건 제 잘못입니다.",
            },
          ],
          mood: "shaken",
          note: "압박 후 계단을 이용했다고 동선을 수정.",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e2"],
          lines: [
            { id: "x1", speakerId: "s2", text: "복도 영상이 없다는 겁니까?" },
            {
              id: "x2",
              speakerId: "me",
              text: "당신이 지나갔다는 그 복도의 그 시간대가 비어 있습니다.",
            },
            { id: "x3", speakerId: "s2", text: "…그건 제가 설명할 수 있는 부분이 아닙니다." },
          ],
          mood: "guarded",
          note: "주장한 퇴근 동선이 CCTV 공백 구간과 겹친다.",
          contradiction: {
            id: "s2-c-cctv",
            title: "퇴근 동선과 CCTV 공백",
            detail:
              "이서연이 지나갔다고 한 복도 구간의 기록이 비어 있다. 실제 이동 경로를 다시 확인해야 한다.",
            unlocksTopicIds: ["s2-t-press-route"],
          },
        },
        {
          evidenceIds: ["e3"],
          lines: [
            { id: "y1", speakerId: "s2", text: "팀장님 노트북이요?" },
            {
              id: "y2",
              speakerId: "s2",
              text: "예산조정 문서라면… 우리 팀 인원 얘기가 들어 있었을 겁니다.",
            },
          ],
          mood: "guarded",
          note: "피해자가 보던 예산조정 문서에 자기 팀 인원 문제가 있었다고 진술.",
        },
      ],
      genericReaction: [
        { id: "g1", speakerId: "s2", text: "그건 제가 판단할 문제가 아닌 것 같습니다." },
      ],
    },

    // ------------------------------------------------------------------ s3
    {
      suspectId: "s3",
      speakerId: "s3",
      requiredTopicIds: ["s3-t-away", "s3-t-pressure", "s3-t-time"],
      topics: [
        {
          id: "s3-t-away",
          label: "자리를 비운 이유가 무엇입니까?",
          lines: [
            { id: "l1", speakerId: "s3", text: "커피요. 1층 자판기에 갔습니다." },
            { id: "l2", speakerId: "s3", text: "오래 걸리지 않았습니다. 10분? 15분?" },
          ],
          note: "최지훈 — 커피를 사러 자리를 비웠다고 주장. 시간은 불확실.",
        },
        {
          id: "s3-t-pressure",
          label: "일정 지연으로 압박을 받았다고 들었습니다.",
          lines: [
            { id: "l1", speakerId: "s3", text: "받았습니다. 매일 받았어요." },
            {
              id: "l2",
              speakerId: "s3",
              text: "그날도 회의에서 제 이름이 세 번 나왔습니다. 다 세고 있었어요.",
            },
          ],
          mood: "guarded",
          note: "회의에서 반복적으로 지적받은 것을 세고 있었다고 진술.",
          choices: [
            {
              id: "c-empathy",
              text: "그런 자리는 버티기 힘들죠.",
              reply: [
                { id: "r1", speakerId: "s3", text: "…이해해 주시는 분이 처음입니다." },
                {
                  id: "r2",
                  speakerId: "s3",
                  text: "그래도 제가 뭘 한 건 아닙니다. 정말입니다.",
                },
              ],
              note: "공감에 반응해 진술이 길어짐.",
            },
            {
              id: "c-blunt",
              text: "그 정도면 원망할 만합니다.",
              reply: [
                { id: "r1", speakerId: "s3", text: "원망은 했습니다. 그건 인정합니다." },
                { id: "r2", speakerId: "s3", text: "그게 죄가 되는 겁니까?" },
              ],
              mood: "shaken",
              note: "원망 감정을 인정.",
            },
          ],
        },
        {
          id: "s3-t-time",
          label: "정확히 몇 시에 자리를 비웠습니까?",
          lines: [
            { id: "l1", speakerId: "s3", text: "회의실 시계를 봤습니다. 22시 조금 전이었어요." },
            { id: "l2", speakerId: "s3", text: "그건 확실합니다." },
          ],
          note: "회의실 시계를 보고 22시 직전에 자리를 비웠다고 진술.",
        },
        {
          id: "s3-t-press-clock",
          label: "그 시계를 정말 봤습니까?",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s3", text: "봤습니다. 왜 그러십니까?" },
            { id: "l2", speakerId: "me", text: "그 시계는 멈춰 있었습니다." },
            {
              id: "l3",
              speakerId: "s3",
              text: "…그럼 제가 본 시간이 실제 시간이 아니었다는 거군요.",
            },
            { id: "l4", speakerId: "s3", text: "저는 그 숫자를 그대로 믿었습니다." },
          ],
          mood: "shaken",
          note: "알리바이의 근거였던 시각이 멈춘 시계에서 나온 것임을 인정.",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e7"],
          lines: [
            { id: "x1", speakerId: "s3", text: "시계가 멈췄다니요. 저는 분명히 봤는데요." },
            { id: "x2", speakerId: "me", text: "본 것은 맞을 겁니다. 다만 시각이 맞지 않습니다." },
          ],
          mood: "shaken",
          note: "멈춘 시계와 본인이 말한 시각이 충돌한다.",
          contradiction: {
            id: "s3-c-clock",
            title: "멈춘 시계에서 나온 알리바이 시각",
            detail:
              "최지훈이 근거로 든 22시 직전이라는 시각은 멈춘 회의실 시계를 본 것이다. 그의 시간 진술은 다시 계산해야 한다.",
            unlocksTopicIds: ["s3-t-press-clock"],
          },
        },
        {
          evidenceIds: ["e2"],
          lines: [
            { id: "y1", speakerId: "s3", text: "복도 영상에 제가 안 찍혔습니까?" },
            { id: "y2", speakerId: "s3", text: "그건… 오히려 제가 답답합니다." },
          ],
          mood: "guarded",
          note: "CCTV 공백으로 본인 동선이 증명되지 않는 것에 답답함을 표현.",
        },
      ],
      genericReaction: [{ id: "g1", speakerId: "s3", text: "그건 제가 모르는 부분입니다. 죄송합니다." }],
    },

    // ------------------------------------------------------------------ s4
    {
      suspectId: "s4",
      speakerId: "s4",
      requiredTopicIds: ["s4-t-meeting", "s4-t-docs", "s4-t-leave"],
      topics: [
        {
          id: "s4-t-meeting",
          label: "팀장과 비공개 면담을 했다고요.",
          lines: [
            { id: "l1", speakerId: "s4", text: "했습니다. 인사평가 관련이었습니다." },
            { id: "l2", speakerId: "s4", text: "내용은… 제 권한으로 말씀드리기 어렵습니다." },
          ],
          mood: "guarded",
          note: "한유리 — 인사평가 관련 비공개 면담이 있었음을 인정.",
          choices: [
            {
              id: "c-formal",
              text: "수사에 필요한 범위만 확인하겠습니다.",
              reply: [
                { id: "r1", speakerId: "s4", text: "그렇게 해주시면 감사합니다." },
                {
                  id: "r2",
                  speakerId: "s4",
                  text: "특정 팀 인원 조정에 대한 검토였습니다. 그 이상은 말씀드릴 수 없습니다.",
                },
              ],
              note: "면담 주제가 특정 팀 인원 조정 검토였다고 진술.",
            },
            {
              id: "c-push",
              text: "사람이 죽었습니다. 권한 이야기를 할 때가 아닙니다.",
              reply: [
                { id: "r1", speakerId: "s4", text: "…죄송합니다." },
                {
                  id: "r2",
                  speakerId: "s4",
                  text: "면담에서 특정 인원의 평가 하향이 논의됐습니다. 확정은 아니었습니다.",
                },
              ],
              mood: "shaken",
              note: "면담에서 특정 인원의 평가 하향이 논의됐다고 진술.",
            },
          ],
        },
        {
          id: "s4-t-docs",
          label: "팀장이 검토하던 자료를 알고 있었습니까?",
          lines: [
            { id: "l1", speakerId: "s4", text: "일부는 제가 올린 자료입니다." },
            { id: "l2", speakerId: "s4", text: "면담기록도 포함돼 있었을 겁니다." },
          ],
          note: "피해자가 검토하던 자료 일부를 본인이 제출했다고 진술.",
        },
        {
          id: "s4-t-leave",
          label: "그날 몇 시에 사무실을 떠났습니까?",
          lines: [
            { id: "l1", speakerId: "s4", text: "자료 정리 끝내고 나왔습니다. 21시 반쯤이요." },
            { id: "l2", speakerId: "s4", text: "12층에는 다시 올라가지 않았습니다." },
          ],
          note: "21시 30분경 퇴근, 12층 재방문 없음을 주장.",
        },
        {
          id: "s4-t-press-docs",
          label: "면담기록이 열려 있던 이유를 설명해 주십시오.",
          kind: "PRESSURE",
          lines: [
            { id: "l1", speakerId: "s4", text: "제가 보낸 파일이 열려 있었다는 건가요?" },
            { id: "l2", speakerId: "me", text: "사건 직전까지 열람된 상태였습니다." },
            {
              id: "l3",
              speakerId: "s4",
              text: "…그 파일은 그날 저녁에 다시 보냈습니다. 팀장님이 요청하셔서요.",
            },
            { id: "l4", speakerId: "s4", text: "퇴근 전이라고 말씀드렸는데, 실은 그 이후였습니다." },
          ],
          mood: "shaken",
          note: "압박 후 퇴근 이후에도 피해자와 파일을 주고받았다고 진술 변경.",
        },
      ],
      evidenceReactions: [
        {
          evidenceIds: ["e3"],
          lines: [
            { id: "x1", speakerId: "s4", text: "면담기록까지 열려 있었습니까." },
            { id: "x2", speakerId: "s4", text: "…그건 저와 팀장님만 볼 수 있는 문서입니다." },
          ],
          mood: "guarded",
          note: "피해자 노트북에 열려 있던 면담기록이 두 사람만 접근 가능한 문서라고 진술.",
          contradiction: {
            id: "s4-c-docs",
            title: "퇴근 시각과 마지막 열람 기록",
            detail:
              "한유리는 21시 30분에 퇴근했다고 했지만, 두 사람만 접근할 수 있는 면담기록이 그 이후까지 열람되어 있었다.",
            unlocksTopicIds: ["s4-t-press-docs"],
          },
        },
        {
          evidenceIds: ["e6"],
          lines: [
            { id: "y1", speakerId: "s4", text: "정전이 있었나요? 저는 몰랐습니다." },
            { id: "y2", speakerId: "s4", text: "인사팀은 10층입니다. 12층 설비는 잘 모릅니다." },
          ],
          note: "정전 사실을 몰랐다고 진술. 근무 층이 다르다는 점을 강조.",
        },
      ],
      genericReaction: [
        { id: "g1", speakerId: "s4", text: "그 부분은 제가 확인해 드릴 수 있는 내용이 아닙니다." },
      ],
    },
  ],
};
