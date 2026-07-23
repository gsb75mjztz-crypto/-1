import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl } from "./siteUrl";

test("resolveSiteUrl", async (t) => {
  await t.test("falls back to localhost when nothing is set", () => {
    assert.equal(resolveSiteUrl({}), "http://localhost:3000");
  });

  await t.test(
    "uses VERCEL_URL when only that is set (preview deployments)",
    () => {
      assert.equal(
        resolveSiteUrl({ VERCEL_URL: "my-app-git-feat-team.vercel.app" }),
        "https://my-app-git-feat-team.vercel.app",
      );
    },
  );

  await t.test(
    "prefers VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL when both are set",
    () => {
      assert.equal(
        resolveSiteUrl({
          VERCEL_PROJECT_PRODUCTION_URL: "investorhub.com",
          VERCEL_URL: "investorhub-abc123.vercel.app",
        }),
        "https://investorhub.com",
      );
    },
  );

  await t.test(
    "never throws on an empty-string value — the exact bug this replaces",
    () => {
      assert.doesNotThrow(() => resolveSiteUrl({ VERCEL_URL: "" }));
      assert.equal(resolveSiteUrl({ VERCEL_URL: "" }), "http://localhost:3000");
    },
  );
});
