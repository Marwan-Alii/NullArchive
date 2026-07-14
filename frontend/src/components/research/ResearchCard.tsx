import { Link } from "react-router-dom";
import type { ResearchEntryListItem } from "../../types";
import ResultStamp from "../ui/ResultStamp";

export default function ResearchCard({ entry }: { entry: ResearchEntryListItem }) {
  return (
    <Link
      to={`/research/${entry.slug}`}
      className="group block border border-line rounded bg-white p-5 hover:border-navy/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-inkmute">
          {entry.category.name}
        </span>
        <ResultStamp type={entry.research_type} size="sm" />
      </div>

      <h3 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-navy transition-colors mb-2">
        {entry.title}
      </h3>

      <p className="text-sm text-inkmute leading-relaxed mb-4 line-clamp-3">
        {entry.abstract}
      </p>

      <div className="flex items-center justify-between text-xs text-inkmute pt-3 border-t border-line">
        <span>
          {entry.author.name}
          {entry.author.institution ? ` · ${entry.author.institution.split(",")[0]}` : ""}
        </span>
        <span className="font-mono">{entry.view_count.toLocaleString()} views</span>
      </div>
    </Link>
  );
}
