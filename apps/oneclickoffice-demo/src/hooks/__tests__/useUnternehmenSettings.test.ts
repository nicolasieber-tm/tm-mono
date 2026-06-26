import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const state: {
  nextSelectResult: { data: unknown; error: unknown } | null;
  nextUpdateResult: { data: unknown; error: unknown } | null;
} = {
  nextSelectResult: null,
  nextUpdateResult: null,
};

function makeSelectChain() {
  const chain: Record<string, unknown> = {};
  chain.single = vi.fn(() =>
    Promise.resolve(state.nextSelectResult ?? { data: null, error: null })
  );
  return chain;
}

function makeUpdateChain() {
  const chain: Record<string, unknown> = {};
  chain.eq = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(() =>
    Promise.resolve(state.nextUpdateResult ?? { data: null, error: null })
  );
  return chain;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => makeSelectChain()),
      update: vi.fn(() => makeUpdateChain()),
    })),
  },
}));

import {
  useUnternehmenSettings,
  useUpdateUnternehmenSettings,
} from "../useUnternehmenSettings";

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  state.nextSelectResult = null;
  state.nextUpdateResult = null;
});

describe("useUnternehmenSettings", () => {
  it("loads settings successfully", async () => {
    state.nextSelectResult = {
      data: { id: "u1", client_notes_visibility: "alle_mitarbeiter" },
      error: null,
    };

    const { result } = renderHook(() => useUnternehmenSettings(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.client_notes_visibility).toBe(
      "alle_mitarbeiter"
    );
  });

  it("liest expense_client_linking_enabled", async () => {
    state.nextSelectResult = {
      data: {
        id: "u1",
        client_notes_visibility: "alle_mitarbeiter",
        client_hierarchy_mode: "two_level",
        expense_client_linking_enabled: true,
      },
      error: null,
    };

    const { result } = renderHook(() => useUnternehmenSettings(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.expense_client_linking_enabled).toBe(true);
  });

  it("surfaces errors", async () => {
    state.nextSelectResult = { data: null, error: { message: "denied" } };

    const { result } = renderHook(() => useUnternehmenSettings(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useUpdateUnternehmenSettings", () => {
  it("updates visibility successfully", async () => {
    state.nextUpdateResult = {
      data: { id: "u1", client_notes_visibility: "nur_autor" },
      error: null,
    };

    const { result } = renderHook(() => useUpdateUnternehmenSettings(), {
      wrapper,
    });

    await result.current.mutateAsync({
      id: "u1",
      client_notes_visibility: "nur_autor",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("aktualisiert expense_client_linking_enabled", async () => {
    state.nextUpdateResult = {
      data: { id: "u1", expense_client_linking_enabled: true },
      error: null,
    };

    const { result } = renderHook(() => useUpdateUnternehmenSettings(), {
      wrapper,
    });

    await result.current.mutateAsync({
      id: "u1",
      expense_client_linking_enabled: true,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on update error", async () => {
    state.nextUpdateResult = { data: null, error: { message: "denied" } };

    const { result } = renderHook(() => useUpdateUnternehmenSettings(), {
      wrapper,
    });

    await expect(
      result.current.mutateAsync({
        id: "u1",
        client_notes_visibility: "nur_autor",
      })
    ).rejects.toBeTruthy();
  });
});
