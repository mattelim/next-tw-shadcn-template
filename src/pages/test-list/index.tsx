import { ReactElement } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/db";
import DefaultLayout from "@/layouts/DefaultLayout";
export default function CodeBlockList() {
  const codeBlocks = useLiveQuery(() => db.codeBlocks.toArray());
  // console.log(codeBlocks);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <ul>
        {codeBlocks?.map((codeBlock) => (
          <li key={codeBlock.id}>
            <Link href={`/code-block/${codeBlock.id}`}>
              {codeBlock.title} {codeBlock.id}{" "}
              {codeBlock.codeInstances[0].programmingLanguage}
            </Link>
            <Button
              variant={"destructive"}
              onClick={(e) => {
                db.codeBlocks.delete(codeBlock.id);
              }}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

CodeBlockList.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};
