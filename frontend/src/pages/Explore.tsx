import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useCategories } from "../lib/useCategories";
import ResearchCard from "../components/research/ResearchCard";
import type { ResearchEntryListItem, ResearchType } from "../types";

const typeOptions: ResearchType[] = [
  "Failed Experiment",
  "Negative Result",
  "Null Result",
  "Failed Replication",
  "Unexpected Outcome",
];

type SortOption = "latest" | "most_viewed" | "most_discussed";

export default function Explore() {
  const [params] = useSearchParams();
  const { categories } = useCategories();

  const [query, setQuery] = useState("");
  const [field, setField] = useState<string>(params.get("field") || "All");
  const [type, setType] = useState<ResearchType | "All">("All");
  const [sort, setSort] = useState<SortOption>("latest");

  const [results, setResults] = useState<ResearchEntryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const searchParams = new URLSearchParams();
    if (query.trim()) searchParams.set("q", query.trim());
    if (field !== "All") searchParams.set("field", field);
    if (type !== "All") searchParams.set("research_type", type);
    searchParams.set("sort", sort);

    // Debounce so we don't fire a request on every keystroke.
    const timeout = setTimeout(() => {
      api
        .get<ResearchEntryListItem[]>(`/api/research?${searchParams.toString()}`)
        .then(setResults)
        .catch(() => setError("Couldn't reach the archive. Is the backend running?"))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, field, type, sort]);

  return (
    <div className="container-page py-14">
      <div className="max-w-2xl mb-10">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-3">
          Research Explorer
        </h1>
        <p className="text-inkmute leading-relaxed">
          Search the archive by title, keyword, author, or field. Every entry
          here documents an approach that didn't produce the expected result —
          and why.
        </p>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-10">
        {/* Filters */}
        <aside className="space-y-8">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-inkmute block mb-2">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, keyword, author..."
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-inkmute block mb-2">
              Field
            </label>
            <div className="space-y-1.5">
              <FilterRadio label="All fields" active={field === "All"} onClick={() => setField("All")} />
              {categories.map((c) => (
                <FilterRadio key={c.id} label={c.name} active={field === c.slug} onClick={() => setField(c.slug)} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-inkmute block mb-2">
              Research type
            </label>
            <div className="space-y-1.5">
              <FilterRadio label="All types" active={type === "All"} onClick={() => setType("All")} />
              {typeOptions.map((t) => (
                <FilterRadio key={t} label={t} active={type === t} onClick={() => setType(t)} />
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
            <p className="text-sm text-inkmute">
              {loading ? "Searching…" : `${results.length} result${results.length !== 1 ? "s" : ""}`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-inkmute">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-sm border border-line rounded-sm px-2 py-1.5 bg-white focus:border-navy outline-none"
              >
                <option value="latest">Latest</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="most_discussed">Most Discussed</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="border border-dashed border-line rounded p-12 text-center text-inkmute text-sm">
              {error}
            </div>
          ) : !loading && results.length === 0 ? (
            <div className="border border-dashed border-line rounded p-12 text-center text-inkmute text-sm">
              No entries match these filters. Try broadening your search — or be
              the first to document this approach.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {results.map((entry) => (
                <ResearchCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterRadio({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm px-2.5 py-1.5 rounded-sm transition-colors ${
        active ? "bg-navy text-white" : "text-inkmute hover:bg-white hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
