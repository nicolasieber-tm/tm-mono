import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

const state: { nextSelectResult: { data: unknown; error: unknown } | null } = {
  nextSelectResult: null,
};

function makeChain() {
  const chain: Record<string, unknown> = {};
  chain.eq = vi.fn(() => chain);
  chain.single = vi.fn(() =>
    Promise.resolve(state.nextSelectResult ?? { data: null, error: null })
  );
  return chain;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => makeChain()) })),
  },
}));

vi.mock("@/contexts/ActiveCompanyContext", () => ({
  useActiveCompany: () => ({ activeCompanyId: "mandant-abc" }),
}));

import {
  useClientHierarchyMode,
  useIsSingleLevel,
} from "../useClientHierarchyMode";

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  state.nextSelectResult = null;
});

describe("useClientHierarchyMode", () => {
  it("returns 'two_level' when DB says so", async () => {
    state.nextSelectResult = {
      data: { client_hierarchy_mode: "two_level" },
      error: null,
    };
    const { result } = renderHook(() => useClientHierarchyMode(), { wrapper });
    await waitFor(() => expect(result.current.data).toBe("two_level"));
  });

  it("returns 'single_level' when DB says so", async () => {
    state.nextSelectResult = {
      data: { client_hierarchy_mode: "single_level" },
      error: null,
    };
    const { result } = renderHook(() => useClientHierarchyMode(), { wrapper });
    await waitFor(() => expect(result.current.data).toBe("single_level"));
  });
});

describe("useIsSingleLevel", () => {
  it("returns true when mode is single_level", async () => {
    state.nextSelectResult = {
      data: { client_hierarchy_mode: "single_level" },
      error: null,
    };
    const { result } = renderHook(() => useIsSingleLevel(), { wrapper });
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("returns false when mode is two_level", async () => {
    state.nextSelectResult = {
      data: { client_hierarchy_mode: "two_level" },
      error: null,
    };
    const { result } = renderHook(() => useIsSingleLevel(), { wrapper });
    await waitFor(() => expect(result.current).toBe(false));
  });
});
