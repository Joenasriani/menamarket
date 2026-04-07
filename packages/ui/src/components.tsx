import type { ReactNode, CSSProperties, MouseEventHandler, ButtonHTMLAttributes } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

const baseSurface = {
  background: "rgba(10, 23, 36, 0.82)",
  border: "1px solid rgba(125, 161, 196, 0.18)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.16)"
} as const;

export function Button({ children, href, variant = "primary", onClick, disabled = false, type = "submit" }: ButtonProps) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 999,
    fontWeight: 600,
    border: variant === "primary" ? "1px solid rgba(55, 195, 166, 0.2)" : "1px solid rgba(125, 161, 196, 0.18)",
    background: variant === "primary" ? "linear-gradient(135deg, #37c3a6, #4aa3ff)" : "rgba(255,255,255,0.04)",
    color: variant === "primary" ? "#08131f" : "#edf3fb",
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? "not-allowed" : "pointer"
  };
  return href
    ? <a href={href} style={style}>{children}</a>
    : <button type={type} style={style} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warning" }) {
  const tones = {
    neutral: { background: "rgba(255,255,255,0.06)", color: "#edf3fb" },
    accent: { background: "rgba(55,195,166,0.14)", color: "#8ce6d6" },
    warning: { background: "rgba(255,209,102,0.14)", color: "#ffe4a3" }
  } as const;
  return <span style={{display: "inline-flex", padding: "8px 10px", borderRadius: 999, fontSize: 12, letterSpacing: "0.03em", ...tones[tone]}}>{children}</span>;
}

export function Card({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return <section style={{...baseSurface, borderRadius: 22, padding: 22}}>{eyebrow ? <div style={{fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "#94a9c0", marginBottom: 8}}>{eyebrow}</div> : null}<h3 style={{margin: 0, fontSize: "1.15rem"}}>{title}</h3><div style={{marginTop: 12, color: "#94a9c0", lineHeight: 1.7}}>{children}</div></section>;
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div>{eyebrow ? <div style={{fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a9c0", marginBottom: 8}}>{eyebrow}</div> : null}<h1 style={{margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em"}}>{title}</h1>{description ? <p style={{margin: "12px 0 0", color: "#94a9c0", lineHeight: 1.7, maxWidth: 860}}>{description}</p> : null}</div>;
}

export function TableShell({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return <div style={{...baseSurface, borderRadius: 18, overflow: "hidden"}}><table style={{width: "100%", borderCollapse: "collapse"}}><thead><tr>{columns.map((column) => <th key={column} style={{textAlign: "left", padding: "14px 16px", fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "#94a9c0", borderBottom: "1px solid rgba(125, 161, 196, 0.18)"}}>{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{padding: "16px", borderBottom: rowIndex === rows.length - 1 ? "none" : "1px solid rgba(125, 161, 196, 0.12)", color: cellIndex === 0 ? "#edf3fb" : "#94a9c0"}}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <section style={{...baseSurface, borderRadius: 22, padding: 22}}><div style={{fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "#94a9c0", marginBottom: 8}}>Empty state</div><h3 style={{margin: 0}}>{title}</h3><p style={{margin: "12px 0 0", color: "#94a9c0", lineHeight: 1.7}}>{description}</p>{action ? <div style={{marginTop: 16}}>{action}</div> : null}</section>;
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return <section style={{...baseSurface, borderRadius: 22, padding: 22, border: "1px solid rgba(255, 123, 123, 0.18)"}}><div style={{fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "#ffb2b2", marginBottom: 8}}>Error state</div><h3 style={{margin: 0}}>{title}</h3><p style={{margin: "12px 0 0", color: "#94a9c0", lineHeight: 1.7}}>{description}</p></section>;
}
