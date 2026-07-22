import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ResultStamp from "../components/ui/ResultStamp";
import type { ResearchEntryDetail } from "../types";

const attachmentIcon: Record<string, string> = {
  paper: "PDF",
  image: "IMG",
  code: "SRC",
  data: "DAT",
};

export default function ResearchDetail() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [entry, setEntry] = useState<ResearchEntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    api
      .get<ResearchEntryDetail>(`/api/research/${slug}`)
      .then(setEntry)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function submitComment() {
    if (!entry || !commentBody.trim()) return;
    setPosting(true);
    setCommentError(null);
    try {
      const comment = await api.post(`/api/research/${entry.slug}/comments`, {
        body: commentBody.trim(),
      });
      setEntry({ ...entry, comments: [...entry.comments, comment as any] });
      setCommentBody("");
    } catch (e) {
      setCommentError(
        e instanceof ApiError && e.status === 401
          ? "Log in to join the discussion."
          : "Couldn't post your comment. Try again."
      );
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return <div className="container-page py-24 text-center text-inkmute">Loading…</div>;
  }

  if (notFound || !entry) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-serif text-2xl text-ink mb-3">Entry not found</p>
        <p className="text-inkmute mb-6">This research entry may have been moved or doesn't exist.</p>
        <Link to="/explore" className="text-navy font-medium hover:underline">
          ← Back to Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <div className="grid lg:grid-cols-[1fr_280px] gap-12">
        <article className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <ResultStamp type={entry.research_type} />
            <span className="font-mono text-xs text-inkmute uppercase tracking-wider">
              {entry.category.name}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight mb-5">
            {entry.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-inkmute pb-6 border-b border-line mb-8">
            <span>
              <Link to={`/profile/${entry.author.id}`} className="text-ink font-medium hover:text-navy">
                {entry.author.name}
              </Link>
              {entry.author.verified && (
                <span className="ml-1.5 text-teal-dark" title="Verified researcher">✓</span>
              )}
            </span>
            {entry.author.institution && <span>{entry.author.institution}</span>}
            {entry.published_at && (
              <span className="font-mono">{new Date(entry.published_at).toLocaleDateString()}</span>
            )}
          </div>

          <Section title="Abstract">{entry.abstract}</Section>
          <Section title="Research Question">{entry.research_question}</Section>
          <Section title="Original Hypothesis">{entry.hypothesis}</Section>
          <Section title="Methodology">{entry.methodology}</Section>
          <Section title="Expected Outcome">{entry.expected_outcome}</Section>
          <Section title="Actual Outcome">{entry.actual_outcome}</Section>
          <Section title="Why It Failed" highlight>{entry.why_it_failed}</Section>
          <Section title="Lessons Learned" highlight>{entry.lessons_learned}</Section>

          {entry.references && (
            <div className="mb-10">
              <h2 className="font-serif text-lg font-semibold text-ink mb-3">References</h2>
              <ul className="space-y-1.5 text-sm text-inkmute list-disc list-inside">
                {entry.references.split("\n").filter(Boolean).map((ref) => (
                  <li key={ref}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-10">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">Attachments</h2>
            {entry.attachments.length === 0 ? (
              <p className="text-sm text-inkmute">No files attached to this entry.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {entry.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-line rounded-sm px-3 py-2.5 bg-white hover:border-navy/40 transition-colors"
                  >
                    <span className="font-mono text-[10px] w-9 text-center bg-paper border border-line rounded-sm py-1 text-inkmute">
                      {attachmentIcon[att.kind]}
                    </span>
                    <div className="text-sm">
                      <p className="text-ink">{att.filename}</p>
                      <p className="text-xs text-inkmute">{Math.round(att.size_bytes / 1024)} KB · Download</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-serif text-lg font-semibold text-ink mb-4">
              Discussion ({entry.comments.length})
            </h2>
            <div className="space-y-5 mb-6">
              {entry.comments.map((c) => (
                <div key={c.id} className="border-l-2 border-line pl-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-ink">{c.author.name}</span>
                    <span className="text-xs text-inkmute font-mono">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-inkmute leading-relaxed">{c.body}</p>
                </div>
              ))}
              {entry.comments.length === 0 && (
                <p className="text-sm text-inkmute">
                  No discussion yet. Be the first to comment on this finding.
                </p>
              )}
            </div>

            {user ? (
              <>
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Add to the discussion — ask a question, note a related result, or suggest a next step."
                  rows={3}
                  className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none resize-none"
                />
                {commentError && <p className="text-xs text-red-500 mt-1">{commentError}</p>}
                <button
                  onClick={submitComment}
                  disabled={posting || !commentBody.trim()}
                  className="mt-2 bg-navy text-white text-sm font-medium px-4 py-2 rounded-sm hover:bg-navy-dark transition-colors disabled:opacity-50"
                >
                  {posting ? "Posting…" : "Post comment"}
                </button>
              </>
            ) : (
              <p className="text-sm text-inkmute">
                <Link to="/login" className="text-navy font-medium hover:underline">
                  Log in
                </Link>{" "}
                to join the discussion.
              </p>
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="border border-line rounded p-5 bg-white">
            <h3 className="text-xs font-mono uppercase tracking-wider text-inkmute mb-3">
              Credibility
            </h3>
            <dl className="space-y-2.5 text-sm">
              <Stat label="Verified researcher" value={entry.author.verified ? "Yes" : "Unverified"} />
              <Stat label="Views" value={entry.view_count.toLocaleString()} />
              <Stat label="Discussion" value={`${entry.comments.length} comments`} />
              <Stat label="Citations" value={entry.citation_count.toString()} />
            </dl>
          </div>

          <div className="border border-line rounded p-5 bg-white">
            <h3 className="text-xs font-mono uppercase tracking-wider text-inkmute mb-3">
              Author
            </h3>
            <p className="font-serif font-semibold text-ink mb-1">{entry.author.name}</p>
            {entry.author.institution && (
              <p className="text-sm text-inkmute mb-3">{entry.author.institution}</p>
            )}
            <Link to={`/profile/${entry.author.id}`} className="text-sm text-navy font-medium hover:underline">
              View profile →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  highlight = false,
}: {
  title: string;
  children: string;
  highlight?: boolean;
}) {
  return (
    <div className={`mb-8 ${highlight ? "border-l-2 border-teal pl-5" : ""}`}>
      <h2 className="font-serif text-lg font-semibold text-ink mb-2">{title}</h2>
      <p className="text-inkmute leading-relaxed">{children}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-inkmute">{label}</dt>
      <dd className="text-ink font-medium">{value}</dd>
    </div>
  );
}
