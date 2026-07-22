import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useCategories } from "../lib/useCategories";
import type { ResearchEntryListItem } from "../types";
import ResearchCard from "../components/research/ResearchCard";

const fieldIcon: Record<string, string> = {
  "Artificial Intelligence": "AI",
  "Computer Science": "CS",
  Electronics: "EL",
  Physics: "PH",
  Biology: "BI",
  Chemistry: "CH",
  Mathematics: "MA",
  Engineering: "EN",
  "Medicine & Health Sciences": "MD",
  Psychology: "PS",
  Neuroscience: "NS",
  "Environmental Science": "EV",
  "Earth & Geological Sciences": "EG",
  "Astronomy & Astrophysics": "AS",
  "Materials Science": "MS",
  Economics: "EC",
  "Social Sciences": "SS",
  Linguistics: "LN",
  "Agriculture & Food Science": "AG",
  Education: "ED",
};

export default function Landing() {
  const { categories } = useCategories();
  const [recent, setRecent] = useState<ResearchEntryListItem[]>([]);

  useEffect(() => {
    api
      .get<ResearchEntryListItem[]>("/api/research?sort=latest")
      .then((entries) => setRecent(entries.slice(0, 3)))
      .catch(() => setRecent([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="container-page py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="stamp border-navy text-navy mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Open Archive &middot; Est. 2026
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08] text-ink mb-6">
              Every experiment leaves knowledge behind.
            </h1>
            <p className="text-lg text-inkmute leading-relaxed max-w-2xl mb-10">
              NullArchive is an open repository for negative scientific results,
              failed experiments, and research paths that did not work.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/explore"
                className="bg-navy text-white px-6 py-3 rounded-sm font-medium hover:bg-navy-dark transition-colors"
              >
                Explore Research
              </Link>
              <Link
                to="/submit"
                className="border border-line text-ink px-6 py-3 rounded-sm font-medium hover:border-navy hover:text-navy transition-colors"
              >
                Submit a Finding
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container-page py-20 border-b border-line">
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-4">
              Modern science has a hidden problem.
            </h2>
          </div>
          <div className="md:col-span-3 space-y-4 text-inkmute leading-relaxed">
            <p>
              Successful experiments get published. Failed experiments disappear —
              filed away in lab notebooks, private Slack channels, and abandoned
              GitHub branches that no one outside the original team will ever see.
            </p>
            <p>
              The result: millions of researcher-hours are spent repeating
              approaches that have already been tried, and already failed,
              somewhere else.
            </p>
            <p className="text-ink font-medium">
              NullArchive exists to preserve that hidden knowledge, and make it
              searchable, citable, and reusable.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-20 border-b border-line">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-12">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Document the experiment",
              body: "Researchers record what they tried, why, how they tested it, and what actually happened — using a structured template built for negative results.",
            },
            {
              title: "The community learns",
              body: "Findings are indexed, searchable, and open for discussion, so other researchers can evaluate the methodology and its relevance to their own work.",
            },
            {
              title: "Future researchers avoid the dead end",
              body: "The next person considering the same approach finds it here first, and either avoids it or builds on the lessons already learned.",
            },
          ].map((step, i) => (
            <div key={step.title} className="border-t-2 border-navy pt-5">
              <span className="font-mono text-xs text-inkmute">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-lg font-semibold text-ink mt-2 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-inkmute leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Research Areas */}
      <section className="container-page py-20 border-b border-line">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink">
            Research areas
          </h2>
          <Link to="/explore" className="text-sm text-navy font-medium hover:underline">
            View all fields →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?field=${encodeURIComponent(cat.slug)}`}
              className="border border-line rounded p-5 hover:border-navy/40 hover:bg-white transition-colors"
            >
              <span className="font-mono text-xs text-teal-dark">
                {fieldIcon[cat.name] ?? cat.name.slice(0, 2).toUpperCase()}
              </span>
              <p className="font-serif font-semibold text-ink mt-2">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy text-white">
        <div className="container-page py-16 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {[
            ["10,000+", "Research attempts archived"],
            ["500+", "Researchers"],
            ["50+", "Research fields"],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="font-serif text-4xl font-semibold mb-1">{num}</p>
              <p className="text-white/70 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent findings preview */}
      <section className="container-page py-20">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink">
            Recently archived
          </h2>
          <Link to="/explore" className="text-sm text-navy font-medium hover:underline">
            Explore all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-inkmute border border-dashed border-line rounded p-8 text-center">
            No published findings yet — be the first to{" "}
            <Link to="/submit" className="text-navy hover:underline">
              submit one
            </Link>
            .
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {recent.map((entry) => (
              <ResearchCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
