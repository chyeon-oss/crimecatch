/**
 * Case-agnostic motive / method options for the Final Deduction UI.
 *
 * Killer-logic verification is intentionally NOT implemented here — the
 * accuse screen only needs a stable list of selectable options and their
 * ids so the submit(payload) shape is complete.
 */

export interface DeductionOption {
  id: string;
  label: string;
  description: string;
}

export const MOTIVE_OPTIONS: DeductionOption[] = [
  {
    id: "motive-ambition",
    label: "야망과 승진 경쟁",
    description: "지위·기회·평판을 두고 벌어진 경쟁이 파국을 불렀다.",
  },
  {
    id: "motive-money",
    label: "금전적 이득",
    description: "돈, 상속, 채무 — 재산이 얽힌 이해관계.",
  },
  {
    id: "motive-revenge",
    label: "복수와 원한",
    description: "과거의 배신이나 굴욕이 살의로 이어졌다.",
  },
  {
    id: "motive-cover-up",
    label: "은폐와 침묵",
    description: "피해자가 알아서는 안 될 무언가를 알고 있었다.",
  },
];

export const METHOD_OPTIONS: DeductionOption[] = [
  {
    id: "method-blunt",
    label: "둔기 가격",
    description: "가까이 접근해 계획적으로 휘두른 물리적 타격.",
  },
  {
    id: "method-poison",
    label: "독극물",
    description: "음료·음식 등에 은밀히 혼입된 화학 물질.",
  },
  {
    id: "method-strangulation",
    label: "질식",
    description: "끈, 손 또는 밀폐된 공간을 이용한 호흡 차단.",
  },
  {
    id: "method-staged",
    label: "사고로 위장",
    description: "낙상·감전 등 우연으로 보이도록 연출된 범행.",
  },
];
