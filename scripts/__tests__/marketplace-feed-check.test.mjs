import { describe, expect, it } from "vitest";
import { decideRebuild } from "../marketplace-feed-check.mjs";
import { marketplaceNavEnabled } from "../../src/lib/marketplace-nav";

const built = (sequence, status = "ok") => ({ schemaVersion: 1, status, feed: sequence ? { sequence, generatedAt: "2026-11-08T00:00:00.000Z" } : null });

describe("marketplace feed.sequence rebuild check", () => {
  it("is up to date only when the built sequence equals the Hub's", () => {
    expect(decideRebuild(built(4), { sequence: 4 })).toMatchObject({ status: "up-to-date", exitCode: 0 });
  });
  it("asks for a rebuild when the Hub moved (publication, withdrawal or revocation)", () => {
    expect(decideRebuild(built(2), { sequence: 4 })).toMatchObject({ status: "rebuild-required", exitCode: 10, built: 2, current: 4 });
  });
  it("asks for a rebuild when the build could not read the Hub", () => {
    expect(decideRebuild(built(0, "unavailable"), { sequence: 0 })).toMatchObject({ status: "rebuild-required", exitCode: 10 });
  });
  it("reports instead of guessing when the Hub or the build marker is missing", () => {
    expect(decideRebuild(built(2), null)).toMatchObject({ status: "hub-unavailable", exitCode: 20 });
    expect(decideRebuild(null, { sequence: 2 })).toMatchObject({ status: "no-build-marker", exitCode: 30 });
  });
});

describe("Marketplace navigation entry", () => {
  it("is on by default and off only with PUBLIC_MARKETPLACE_NAV=0", () => {
    expect(marketplaceNavEnabled({})).toBe(true);
    expect(marketplaceNavEnabled({ PUBLIC_MARKETPLACE_NAV: "1" })).toBe(true);
    expect(marketplaceNavEnabled({ PUBLIC_MARKETPLACE_NAV: "0" })).toBe(false);
  });
});
