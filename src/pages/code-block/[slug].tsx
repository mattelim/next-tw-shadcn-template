import { ReactElement, useEffect, useState } from "react";
// import Image from "next/image";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/DefaultLayout";
// import CodeRunner from "@/components/CodeRunner";
import CodeRunnerWrapper from "@/components/CodeRunnerWrapper";
import CodeRunnerDexieWrapper from "@/components/CodeRunnerDexieWrapper";

import { db, TCodeBlock } from "@/lib/db";

export default function CodeBlock() {
  // use query params
  const router = useRouter();
  const { query } = router;
  console.log("Query:", query);
  const codeBlockId = query?.slug ? +query.slug : undefined;
  console.log("Code block ID:", codeBlockId);
  // const codeBlock = codeBlockId ? await db.codeBlocks.get({ id: codeBlockId }) : null;
  // console.log("Code block:", codeBlock);

  const [isReady, setIsReady] = useState(false);
  const [codeBlock, setCodeBlock] = useState<TCodeBlock | undefined>(undefined);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (codeBlockId !== undefined) {
        if (!isNaN(codeBlockId)) {
          const codeBlock = await db.codeBlocks.get({ id: codeBlockId });
          if (codeBlock) {
            console.log("Valid code block found:", codeBlock);
            setCodeBlock(codeBlock);
          } else {
            console.log("No code block found with ID:", codeBlockId);
            router.push("/code-block");
          }
        }
        setIsReady(true);
      }
    }
    fetchData();
  }, [codeBlockId]);

  useEffect(() => {
    if (updateCount > 0) {
      console.log("Update count:", updateCount);
      async function fetchData() {
        const codeBlock = await db.codeBlocks.get({ id: codeBlockId });
        if (codeBlock) {
          console.log("Valid code block found:", codeBlock);
          setCodeBlock(codeBlock);
        }
      }
      fetchData();
    }
  }, [updateCount]);

  useEffect(() => {
    console.log("Is ready:", isReady, "Code block:", codeBlock);
    if (isReady && isNaN(codeBlockId as number)) {
      router.push("/code-block");
    }
  }, [isReady]);

  return (
    <>
      <main className="w-full">
        {isReady &&
          (codeBlock ? (
            <CodeRunnerDexieWrapper
              codeBlock={codeBlock}
              setUpdateCount={setUpdateCount}
            />
          ) : (
            <CodeRunnerWrapper />
          ))}
      </main>
      <footer className=""></footer>
    </>
  );
}

CodeBlock.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};
