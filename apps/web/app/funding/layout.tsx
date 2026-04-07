import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funding — MENAMarket",
  description: "Manage funding and payout requests for your MENAMarket account."
};

export default function FundingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
