import { geistMono, geistSans } from "@/lib/utils";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] w-full`}
    >
      <header></header>
      {children}
    </div>
  );
}
