import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../lib/useCategories";
import type { ResearchType } from "../types";

interface FormState {
  title: string;
  category_id: string;
  research_type: ResearchType | "";
  abstract: string;
  research_question: string;
  hypothesis: string;
  methodology: string;
  expected_outcome: string;
  actual_outcome: string;
  why_it_failed: string;
  lessons_learned: string;
  references: string;
}

const initialState: FormState = {
  title: "",
  category_id: "",
  research_type: "",
  abstract: "",
  research_question: "",
  hypothesis: "",
  methodology: "",
  expected_outcome: "",
  actual_outcome: "",
  why_it_failed: "",
  lessons_learned: "",
  references: "",
};

const requiredFields: (keyof FormState)[] = [
  "title",
  "category_id",
  "research_type",
  "abstract",
  "hypothesis",
  "methodology",
  "actual_outcome",
  "why_it_failed",
  "lessons_learned",
];

const typeOptions: ResearchType[] = [
  "Failed Experiment",
  "Negative Result",
  "Null Result",
  "Failed Replication",
  "Unexpected Outcome",
];

const EXTENSION_KIND: Record<string, "paper" | "image" | "code" | "data"> = {
  pdf: "paper",
  doc: "paper",
  docx: "paper",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  py: "code",
  js: "code",
  ts: "code",
  ipynb: "code",
  zip: "code",
  csv: "data",
  json: "data",
  xlsx: "data",
  parquet: "data",
  h5: "data",
};

function inferKind(filename: string): "paper" | "image" | "code" | "data" {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_KIND[ext] ?? "data";
}

export default function Submit() {
  const { user, loading: authLoading } = useAuth();
  const { categories } = useCategories();

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    for (const field of requiredFields) {
      if (!form[field].trim()) next[field] = "This field is required.";
    }
    if (form.abstract && form.abstract.trim().length < 40) {
      next.abstract = "Abstract should be at least 40 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const entry = await api.post<{ slug: string }>("/api/research", {
        ...form,
        research_type: form.research_type,
        references: form.references || undefined,
      });

      if (files.length > 0) {
        setUploadStatus(`Uploading 1 of ${files.length}…`);
        let failed = 0;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadStatus(`Uploading ${i + 1} of ${files.length}…`);
          const formData = new FormData();
          formData.append("file", file);
          try {
            await api.post(
              `/api/research/${entry.slug}/attachments?kind=${inferKind(file.name)}`,
              formData
            );
          } catch {
            failed++;
          }
        }
        setUploadStatus(
          failed > 0 ? `${files.length - failed} of ${files.length} files uploaded (${failed} failed).` : null
        );
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Something went wrong submitting your finding."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return <div className="container-page py-24 text-center text-inkmute">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="container-page py-24 max-w-md mx-auto text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-3">Log in to submit a finding</h1>
        <p className="text-inkmute mb-6">
          Submissions are tied to a researcher profile so the archive can attribute and credit your work.
        </p>
        <Link to="/login" className="bg-navy text-white px-6 py-3 rounded-sm font-medium hover:bg-navy-dark transition-colors">
          Log in
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container-page py-24 max-w-xl text-center">
        <span className="stamp border-teal-dark text-teal-dark mx-auto mb-6">Published</span>
        <h1 className="font-serif text-3xl font-semibold text-ink mb-4">
          Thanks — your finding is now in the archive.
        </h1>
        <p className="text-inkmute leading-relaxed mb-8">
          It's live and searchable in the Explorer right away. A reviewer
          approval step is planned for the future — for now, entries publish
          as soon as they're submitted.
          {files.length > 0 && (
            <>
              {" "}
              {uploadStatus ?? `All ${files.length} file${files.length !== 1 ? "s" : ""} uploaded successfully.`}
            </>
          )}
        </p>
        <button
          onClick={() => {
            setForm(initialState);
            setFiles([]);
            setUploadStatus(null);
            setSubmitted(false);
          }}
          className="text-navy font-medium hover:underline"
        >
          Submit another finding
        </button>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <div className="max-w-2xl mb-10">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-3">Submit a Finding</h1>
        <p className="text-inkmute leading-relaxed">
          Document what you tried, why, and what actually happened. Specificity
          is what makes an entry useful to the next researcher — vague write-ups
          get sent back in review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        <Field label="Title" error={errors.title}>
          <input
            className={inputClass(!!errors.title)}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="A specific, descriptive title of what was tested"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Research Field" error={errors.category_id}>
            <select
              className={inputClass(!!errors.category_id)}
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
            >
              <option value="">Select a field</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Research Type" error={errors.research_type}>
            <select
              className={inputClass(!!errors.research_type)}
              value={form.research_type}
              onChange={(e) => update("research_type", e.target.value)}
            >
              <option value="">Select a type</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Abstract" error={errors.abstract} hint="A short summary of the attempt and result (2-4 sentences).">
          <textarea className={inputClass(!!errors.abstract)} rows={3} value={form.abstract} onChange={(e) => update("abstract", e.target.value)} />
        </Field>

        <Field label="Research Question (optional)" error={errors.research_question}>
          <textarea className={inputClass(!!errors.research_question)} rows={2} value={form.research_question} onChange={(e) => update("research_question", e.target.value)} />
        </Field>

        <Field label="Original Hypothesis" error={errors.hypothesis} hint="What did you expect to happen, and why?">
          <textarea className={inputClass(!!errors.hypothesis)} rows={3} value={form.hypothesis} onChange={(e) => update("hypothesis", e.target.value)} />
        </Field>

        <Field label="Methodology" error={errors.methodology} hint="How was it tested? Include enough detail to be reproducible.">
          <textarea className={inputClass(!!errors.methodology)} rows={4} value={form.methodology} onChange={(e) => update("methodology", e.target.value)} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Expected Result (optional)" error={errors.expected_outcome}>
            <textarea className={inputClass(!!errors.expected_outcome)} rows={3} value={form.expected_outcome} onChange={(e) => update("expected_outcome", e.target.value)} />
          </Field>
          <Field label="Actual Result" error={errors.actual_outcome}>
            <textarea className={inputClass(!!errors.actual_outcome)} rows={3} value={form.actual_outcome} onChange={(e) => update("actual_outcome", e.target.value)} />
          </Field>
        </div>

        <Field label="Failure Explanation" error={errors.why_it_failed} hint="Your best understanding of why it didn't work.">
          <textarea className={inputClass(!!errors.why_it_failed)} rows={4} value={form.why_it_failed} onChange={(e) => update("why_it_failed", e.target.value)} />
        </Field>

        <Field label="Lessons Learned" error={errors.lessons_learned} hint="What should someone attempting something similar know before they start?">
          <textarea className={inputClass(!!errors.lessons_learned)} rows={4} value={form.lessons_learned} onChange={(e) => update("lessons_learned", e.target.value)} />
        </Field>

        <Field label="References" hint="One per line. Optional.">
          <textarea className={inputClass(false)} rows={3} value={form.references} onChange={(e) => update("references", e.target.value)} />
        </Field>

        <div>
          <label className="text-sm font-medium text-ink block mb-2">Upload Files</label>
          <label className="block border border-dashed border-line rounded p-8 text-center text-sm text-inkmute bg-white cursor-pointer hover:border-navy/40 transition-colors">
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                setFiles((prev) => [...prev, ...picked]);
                e.target.value = "";
              }}
            />
            Click to choose files, or drag them here — papers, images, code, or data.
            <br />
            <span className="text-xs">The type (paper/image/code/data) is detected automatically from the file extension.</span>
          </label>

          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between text-sm border border-line rounded-sm px-3 py-2 bg-white"
                >
                  <span className="text-ink">
                    {f.name}{" "}
                    <span className="text-xs text-inkmute font-mono">({inferKind(f.name)})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-xs text-inkmute hover:text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {uploadStatus && (
          <p className="text-sm text-inkmute">{uploadStatus}</p>
        )}

        {submitError && (
          <p className="text-sm text-red-500 border border-red-200 bg-red-50 rounded-sm px-3 py-2">
            {submitError}
          </p>
        )}

        <div className="pt-4 border-t border-line flex items-center justify-between">
          <p className="text-xs text-inkmute max-w-xs">
            Entries publish immediately for now — there's no reviewer queue yet.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="bg-navy text-white font-medium px-6 py-3 rounded-sm hover:bg-navy-dark transition-colors disabled:opacity-50"
          >
            {submitting ? (uploadStatus ?? "Submitting…") : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full border rounded-sm px-3 py-2 text-sm bg-white outline-none transition-colors ${
    hasError ? "border-red-400 focus:border-red-400" : "border-line focus:border-navy"
  }`;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1.5">{label}</label>
      {hint && <p className="text-xs text-inkmute mb-1.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
