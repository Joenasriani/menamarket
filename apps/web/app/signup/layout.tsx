import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account — MENAMarket",
  description: "Create your MENAMarket account to start trading."
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
