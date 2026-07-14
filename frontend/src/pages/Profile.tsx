import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import ResearchCard from "../components/research/ResearchCard";
import type { ResearchEntryListItem, User } from "../types";

export default function Profile() {
  const { id } = useParams();
  const [author, setAuthor] = useState<User | null>(null);
  const [published, setPublished] = useState<ResearchEntryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([
      api.get<User>(`/api/users/${id}`),
      api.get<ResearchEntryListItem[]>(`/api/research?author_id=${id}&sort=latest`),
    ])
      .then(([user, entries]) => {
        setAuthor(user);
        setPublished(entries);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="container-page py-24 text-center text-inkmute">Loading…</div>;
  }

  if (notFound || !author) {
    return (
      <div className="container-page py-24 text-center text-inkmute">
        This researcher profile couldn't be found.
      </div>
    );
  }

  const totalViews = published.reduce((sum, e) => sum + e.view_count, 0);
  const initials = author.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container-page py-14">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-line mb-10">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-sm bg-navy text-white flex items-center justify-center font-serif text-xl font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-serif text-2xl font-semibold text-ink">{author.name}</h1>
              {author.verified && (
                <span className="stamp border-teal-dark text-teal-dark text-[10px] px-1.5 py-0.5">Verified</span>
              )}
            </div>
            {author.institution && <p className="text-inkmute mb-3">{author.institution}</p>}
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-6 text-center sm:text-left shrink-0">
          <Stat label="Published" value={published.length.toString()} />
          <Stat label="Total views" value={totalViews.toLocaleString()} />
          <Stat label="Reputation" value={author.reputation.toString()} />
        </dl>
      </div>

      {author.bio && <p className="text-inkmute leading-relaxed max-w-2xl mb-10">{author.bio}</p>}

      <h2 className="font-serif text-xl font-semibold text-ink mb-6">
        Published findings ({published.length})
      </h2>
      {published.length === 0 ? (
        <p className="text-sm text-inkmute">No findings published under this profile yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {published.map((entry) => (
            <ResearchCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-mono uppercase tracking-wider text-inkmute mb-1">{label}</dt>
      <dd className="font-serif text-xl font-semibold text-ink">{value}</dd>
    </div>
  );
}
