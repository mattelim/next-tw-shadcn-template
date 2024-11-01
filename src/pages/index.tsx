import { ReactElement } from "react";
// import Image from "next/image";
import localFont from "next/font/local";

import DefaultLayout from "@/layouts/DefaultLayout";
// import CodeRunner from "@/components/CodeRunner";
import CodeRunnerWrapper from "@/components/CodeRunnerWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] w-full`}
    >
      <main className="w-full">
        <CodeRunnerWrapper />
      </main>
      <footer className="">
      </footer>
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};