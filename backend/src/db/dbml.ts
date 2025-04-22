import * as schema from "./index.ts";
import { sqliteGenerate } from "drizzle-dbml-generator"; // Using Postgres for this example

const out = "../../../docs/schema.dbml";
// const relational = true;

sqliteGenerate({ schema, out, relational: true });
