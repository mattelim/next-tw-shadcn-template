import Dexie, { type EntityTable } from "dexie";

interface metaData {
  createdAt: Date;
  updatedAt: Date;
  modelUsed: string;
  createdBy: string;
}

interface codeInstances {
  programmingLanguage: string;
  code: string;
  example: string;
}

interface TCodeBlock {
  id: number;
  title: string;
  prompt: string;
  pseudocode: string;
  codeInstances: codeInstances[];
  metaData: metaData;
}

const db = new Dexie("CodeBlocksDatabase") as Dexie & {
  codeBlocks: EntityTable<
    TCodeBlock,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  codeBlocks: "++id, title, prompt, pseudocode, codeInstances, metaData",
});

export type { TCodeBlock };
export { db };
