import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — MENAMarket",
  description: "Sign in to your MENAMarket account."
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
