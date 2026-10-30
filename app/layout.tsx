import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Footstep Maths — Small steps. Stronger maths.",
  description: "A friendly maths-learning journey built around momentum, feedback, and confidence.",
  icons: { icon: "/footstep-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
