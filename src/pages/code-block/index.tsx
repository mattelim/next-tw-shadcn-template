import { ReactElement } from "react";
// import Image from "next/image";
import DefaultLayout from "@/layouts/DefaultLayout";
// import CodeRunner from "@/components/CodeRunner";
import CodeRunnerWrapper from "@/components/CodeRunnerWrapper";

export default function Page() {
  return (
    <>
      <main className="w-full">
        <CodeRunnerWrapper />
      </main>
      <footer className=""></footer>
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};
