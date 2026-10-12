import { readFileSync } from "node:fs";

import { defineRailway, fn, postgres, project } from "railway/iac";

export default defineRailway(() => {
  const db = postgres("db");

  return project("functions", {
    resources: [
      db,

      // A Railway Function is a single file: `code` is base64-encoded into the
      // start command of a service running the function image, so there is no
      // repository to point at. The dashboard shows and edits this source.
      fn("hello", {
        code: `
          export default {
            fetch: () => new Response("hello from a function"),
          };
        `,
        domains: ["hello.example.com"],
      }),

      // Larger functions live in their own file next to railway.ts; the 96 KB
      // limit applies to the decoded source.
      fn("nightly-cleanup", {
        code: readFileSync(new URL("./functions/cleanup.ts", import.meta.url), "utf8"),
        deploy: { cronSchedule: "0 2 * * *", restartPolicyType: "NEVER" },
        env: { DATABASE_URL: db.env.DATABASE_URL },
      }),
    ],
  });
});
