import { ReactElement } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/router";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/db";
import DefaultLayout from "@/layouts/DefaultLayout";
export default function CodeBlockList() {
  const codeBlocks = useLiveQuery(() => db.codeBlocks.toArray());
  // console.log(codeBlocks);

  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <h1 className="font-semibold text-3xl mb-8">breck</h1>
        <div className="flex gap-8">
          <ul className="p-8 bg-gray-100 rounded-lg flex flex-col gap-2">
            <li className="flex justify-start items-center gap-8 bg-white p-4 rounded shadow hover:shadow-lg">
              <Plus />
              <Link href={`/code-block`}>Create new breck</Link>
            </li>
            {codeBlocks?.map((codeBlock) => (
              <li
                className="flex justify-between items-center gap-8 bg-white p-4 rounded shadow hover:shadow-lg"
                key={codeBlock.id}
              >
                <Link href={`/code-block/${codeBlock.id}`}>
                  {codeBlock.title}
                  {/* {codeBlock.id}{" "} */}
                  {/* {codeBlock.codeInstances[0].programmingLanguage} */}
                </Link>
                <Button
                  className="aspect-square p-0"
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
          <div className="p-8 bg-gray-100 rounded-lg flex flex-col gap-4 grow justify-center items-center">
            <Button
              className="aspect-square p-0 h-40 w-40"
              variant={"outline"}
              onClick={(e) => {
                router.push("/flow");
              }}
            >
              Mortar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

CodeBlockList.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};
