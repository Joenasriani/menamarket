/**
 * PreviewNotice — shared read-only / public preview banner component.
 *
 * Rendered as a pure server component (no "use client" needed).
 * Used across login, signup, market detail, funding, and portfolio pages
 * to clearly communicate that a feature is not yet live.
 */
export function PreviewNotice({ message }: { message?: string }) {
  return (
    <div
      style={{
        background: "rgba(255, 209, 102, 0.08)",
        border: "1px solid rgba(255, 209, 102, 0.28)",
        borderRadius: 12,
        padding: "12px 16px",
        color: "#ffd166",
        fontSize: 13,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        lineHeight: 1.6,
      }}
    >
      <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>◎</span>
      <span>
        {message ?? "Public preview — sign-in and trading features are not yet available."}
      </span>
    </div>
  );
}
