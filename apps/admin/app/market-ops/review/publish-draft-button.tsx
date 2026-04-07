"use client";

import { useState } from "react";
import { Button } from "@menamarket/ui";

export default function PublishDraftButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function publish() {
    setState("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/market-publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug })
      });
      const data = (await response.json()) as { market?: { slug: string }; message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Publish failed.");
      }
      setState("done");
      setMessage(`Published ${data.market?.slug ?? slug}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Publish failed.");
    }
  }

  return (
    <div style={{display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end"}}>
      <Button onClick={publish} disabled={state === "submitting"}>
        {state === "submitting" ? "Publishing..." : "Publish draft"}
      </Button>
      {message ? (
        <div style={{color: state === "done" ? "#8ce6d6" : "#ffb2b2", fontSize: 14}}>{message}</div>
      ) : null}
    </div>
  );
}
