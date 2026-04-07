"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, PageHeader } from "@menamarket/ui";

type FormState = {
  question: string;
  slug: string;
  category: string;
  description: string;
  resolutionSource: string;
  closeTimeIso: string;
  jurisdiction: string;
  visibility: "internal" | "public";
  draftStatus: "draft" | "review_ready";
  notes: string;
};

const initialState: FormState = {
  question: "",
  slug: "",
  category: "",
  description: "",
  resolutionSource: "",
  closeTimeIso: "",
  jurisdiction: "",
  visibility: "internal",
  draftStatus: "draft",
  notes: ""
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(125, 161, 196, 0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#edf3fb"
};

export default function CreateDraftPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isReady = useMemo(() => {
    return (
      form.question.trim().length >= 10 &&
      /^[a-z0-9-]+$/.test(form.slug) &&
      form.category.trim().length > 0 &&
      form.resolutionSource.trim().length > 0 &&
      form.closeTimeIso.trim().length > 0 &&
      form.jurisdiction.trim().length > 0
    );
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/market-drafts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          description: form.description || undefined,
          notes: form.notes || undefined
        })
      });

      const data = (await response.json()) as { draft?: { slug: string }; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Draft creation failed.");
      }

      setResult({ ok: true, message: `Draft created: ${data.draft?.slug ?? "unknown-slug"}` });
      setForm(initialState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Draft creation failed.";
      setResult({ ok: false, message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Create draft"
        title="Create a real file-backed draft"
        description="This form writes validated internal draft records to data/market-drafts.json through the admin API route."
      />
      <Card title="Draft input" eyebrow="Validation required">
        <form onSubmit={onSubmit} className="stack">
          <label className="stack">
            <span>Question</span>
            <input style={fieldStyle} value={form.question} onChange={(event) => update("question", event.target.value)} placeholder="Will the specified event occur by the stated date?" />
          </label>
          <label className="stack">
            <span>Slug</span>
            <input style={fieldStyle} value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="event-slug-in-kebab-case" />
          </label>
          <div className="card-grid">
            <label className="stack">
              <span>Category</span>
              <input style={fieldStyle} value={form.category} onChange={(event) => update("category", event.target.value)} />
            </label>
            <label className="stack">
              <span>Jurisdiction</span>
              <input style={fieldStyle} value={form.jurisdiction} onChange={(event) => update("jurisdiction", event.target.value)} />
            </label>
            <label className="stack">
              <span>Close time ISO</span>
              <input style={fieldStyle} value={form.closeTimeIso} onChange={(event) => update("closeTimeIso", event.target.value)} placeholder="2026-12-31T20:00:00.000Z" />
            </label>
          </div>
          <label className="stack">
            <span>Resolution source</span>
            <input style={fieldStyle} value={form.resolutionSource} onChange={(event) => update("resolutionSource", event.target.value)} placeholder="Official source name" />
          </label>
          <label className="stack">
            <span>Description</span>
            <textarea style={{...fieldStyle, minHeight: 110}} value={form.description} onChange={(event) => update("description", event.target.value)} />
          </label>
          <label className="stack">
            <span>Notes</span>
            <textarea style={{...fieldStyle, minHeight: 110}} value={form.notes} onChange={(event) => update("notes", event.target.value)} />
          </label>
          <div className="card-grid">
            <label className="stack">
              <span>Visibility</span>
              <select style={fieldStyle} value={form.visibility} onChange={(event) => update("visibility", event.target.value as FormState["visibility"])}>
                <option value="internal">internal</option>
                <option value="public">public</option>
              </select>
            </label>
            <label className="stack">
              <span>Draft status</span>
              <select style={fieldStyle} value={form.draftStatus} onChange={(event) => update("draftStatus", event.target.value as FormState["draftStatus"])}>
                <option value="draft">draft</option>
                <option value="review_ready">review_ready</option>
              </select>
            </label>
            <div className="stack" style={{justifyContent: "flex-end"}}>
              <span>Validation</span>
              <Badge tone={isReady ? "accent" : "warning"}>{isReady ? "ready to submit" : "missing required fields"}</Badge>
            </div>
          </div>
          <div className="inline">
            <Button>{submitting ? "Creating..." : "Create draft"}</Button>
            <Button href="/market-ops/drafts" variant="secondary">Open drafts</Button>
          </div>
          {result ? (
            <div style={{ color: result.ok ? "#8ce6d6" : "#ffb2b2" }}>
              {result.message}
            </div>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
