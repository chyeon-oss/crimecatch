import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The final deduction now lives inside the mobile investigation shell
 * ("추리" tab), gated on the runtime reaching SCENE 04. This legacy route is
 * kept only so existing links keep working — it redirects instead of
 * exposing a submit surface that could bypass the scene gate.
 */
export const Route = createFileRoute("/case/$caseId/accuse")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/case/$caseId/investigate",
      params: { caseId: params.caseId },
      replace: true,
    });
  },
  head: () => ({
    meta: [{ title: "최종 추리 — CaseNote" }, { name: "robots", content: "noindex" }],
  }),
  component: () => null,
});
