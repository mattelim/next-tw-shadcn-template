import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function CodeBlockList() {
  const codeBlocks = useLiveQuery(() => db.codeBlocks.toArray());
  // console.log(codeBlocks);

  return (
    <ul>
      {codeBlocks?.map((codeBlock) => (
        <li key={codeBlock.id}>{codeBlock.title}</li>
      ))}
    </ul>
  );
}
