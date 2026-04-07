import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity — MENAMarket",
  description: "Live activity feed of orders, fills, settlements, and audit events."
};

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
