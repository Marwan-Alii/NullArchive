import type { ResearchType } from "../../types";

// Each research type gets a distinct stamp color, echoing lab-notebook
// annotation conventions. This is the platform's one recurring signature
// element: every entry is legible from its stamp alone.
const STAMP_STYLES: Record<ResearchType, string> = {
  "Failed Experiment": "border-navy text-navy",
  "Negative Result": "border-teal-dark text-teal-dark",
  "Null Result": "border-ink text-ink",
  "Failed Replication": "border-navy text-navy",
  "Unexpected Outcome": "border-teal-dark text-teal-dark",
};

export default function ResultStamp({
  type,
  size = "md",
}: {
  type: ResearchType;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`stamp bg-white/60 ${STAMP_STYLES[type]} ${
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : ""
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {type}
    </span>
  );
}
