// src/components/marketplace/resources/RuntimeResource.tsx
//
// /marketplace/detalle/?type=<tipo>&slug=<slug>: resolves a resource in the
// browser, for releases published after the last build and for hidden
// (listed:false) links. client:only island: it always talks to the Hub source,
// never to the development fixtures. The page is noindex.
import { useCallback, useEffect, useState } from "react";
import { createHubSource } from "../../../lib/marketplace-resources/client";
import { validSlug } from "../../../lib/marketplace-resources/parse";
import { RESOURCE_TYPES, type DetailResult, type ResourceType } from "../../../lib/marketplace-resources/types";
import ResourceDetailView from "./ResourceDetailView";
import ResourceStateBlock from "./ResourceStateBlock";

type State = { phase: "loading" } | { phase: "done"; result: DetailResult };

export default function RuntimeResource({ hubUrl }: { hubUrl?: string }) {
  const [state, setState] = useState<State>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as ResourceType | null;
    const slug = params.get("slug");
    if (!type || !RESOURCE_TYPES.includes(type) || !validSlug(slug)) {
      setState({ phase: "done", result: { status: "not_found" } });
      return;
    }
    setState({ phase: "loading" });
    createHubSource({ hubUrl }).detail(type, slug).then((result) => setState({ phase: "done", result }));
  }, [hubUrl]);

  useEffect(load, [load, attempt]);

  if (state.phase === "loading") return <ResourceStateBlock kind="loading" />;
  const { result } = state;
  if (result.status === "ok") return <ResourceDetailView resource={result.resource} hubUrl={hubUrl} checkLive />;
  if (result.status === "gone") return <ResourceStateBlock kind={result.availability === "revoked" ? "revoked" : "withdrawn"} replacement={result.replacement} showBack />;
  if (result.status === "not_found") return <ResourceStateBlock kind="not_found" showBack />;
  return <ResourceStateBlock kind="unavailable" onRetry={() => setAttempt((n) => n + 1)} showBack />;
}
