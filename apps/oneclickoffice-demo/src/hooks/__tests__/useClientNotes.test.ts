import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// Mock sonner toasts so they don't explode in jsdom
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock the supabase client module. We build a tiny chainable fluent API
// that lets tests override behaviour per call via `setNextResult`.
const state: {
  nextSelectResult: { data: unknown; error: unknown } | null;
  nextInsertResult: { data: unknown; error: unknown } | null;
  nextUpdateResult: { data: unknown; error: unknown } | null;
  authUser: { id: string } | null;
} = {
  nextSelectResult: null,
  nextInsertResult: null,
  nextUpdateResult: null,
  authUser: { id: "user-1" },
};

function makeSelectChain() {
  const chain: Record<string, unknown> = {};
  const thenable = (resolve: (v: unknown) => void) =>
    resolve(state.nextSelectResult ?? { data: [], error: null });
  chain.eq = vi.fn(() => chain);
  chain.is = vi.fn(() => chain);
  chain.order = vi.fn(() => ({ then: thenable }));
  chain.single = vi.fn(() =>
    Promise.resolve(state.nextSelectResult ?? { data: null, error: null })
  );
  return chain;
}

function makeInsertChain() {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(() =>
    Promise.resolve(state.nextInsertResult ?? { data: null, error: null })
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
  // Allow awaiting the chain directly (e.g. soft-delete: update().eq() without select)
  (chain as { then?: unknown }).then = (resolve: (v: unknown) => void) =>
    resolve(state.nextUpdateResult ?? { data: null, error: null });
  return chain;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.authUser } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => makeSelectChain()),
      insert: vi.fn(() => makeInsertChain()),
      update: vi.fn(() => makeUpdateChain()),
    })),
  },
}));

import {
  useClientNotes,
  useCreateClientNote,
  useUpdateClientNote,
  useSoftDeleteClientNote,
} from "../useClientNotes";

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  state.nextSelectResult = null;
  state.nextInsertResult = null;
  state.nextUpdateResult = null;
  state.authUser = { id: "user-1" };
});

describe("useClientNotes", () => {
  it("loads notes successfully", async () => {
    state.nextSelectResult = {
      data: [
        {
          id: "n1",
          client_id: "c1",
          author_id: "user-1",
          content: "Hallo",
          session_date: null,
          deleted_at: null,
          created_at: "2026-04-15",
          updated_at: "2026-04-15",
        },
      ],
      error: null,
    };

    const { result } = renderHook(() => useClientNotes("c1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].content).toBe("Hallo");
  });

  it("surfaces errors on load failure", async () => {
    state.nextSelectResult = { data: null, error: { message: "RLS denied" } };

    const { result } = renderHook(() => useClientNotes("c1"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useCreateClientNote", () => {
  it("inserts a note with author_id from auth.getUser()", async () => {
    state.nextInsertResult = {
      data: {
        id: "n2",
        client_id: "c1",
        author_id: "user-1",
        content: "Neu",
        session_date: null,
        deleted_at: null,
        created_at: "2026-04-15",
        updated_at: "2026-04-15",
      },
      error: null,
    };

    const { result } = renderHook(() => useCreateClientNote(), { wrapper });

    await result.current.mutateAsync({ clientId: "c1", content: "Neu" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws when insert fails", async () => {
    state.nextInsertResult = { data: null, error: { message: "RLS denied" } };

    const { result } = renderHook(() => useCreateClientNote(), { wrapper });

    await expect(
      result.current.mutateAsync({ clientId: "c1", content: "Neu" })
    ).rejects.toBeTruthy();
  });
});

describe("useUpdateClientNote", () => {
  it("updates only the provided fields", async () => {
    state.nextUpdateResult = {
      data: {
        id: "n1",
        client_id: "c1",
        author_id: "user-1",
        content: "Geändert",
        session_date: null,
        deleted_at: null,
        created_at: "2026-04-15",
        updated_at: "2026-04-15",
      },
      error: null,
    };

    const { result } = renderHook(() => useUpdateClientNote(), { wrapper });

    await result.current.mutateAsync({
      id: "n1",
      clientId: "c1",
      content: "Geändert",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on update error", async () => {
    state.nextUpdateResult = { data: null, error: { message: "nope" } };

    const { result } = renderHook(() => useUpdateClientNote(), { wrapper });

    await expect(
      result.current.mutateAsync({ id: "n1", clientId: "c1", content: "x" })
    ).rejects.toBeTruthy();
  });
});

describe("useSoftDeleteClientNote", () => {
  it("soft-deletes successfully", async () => {
    state.nextUpdateResult = { data: null, error: null };

    const { result } = renderHook(() => useSoftDeleteClientNote(), { wrapper });

    await result.current.mutateAsync({ id: "n1", clientId: "c1" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on soft-delete error", async () => {
    state.nextUpdateResult = { data: null, error: { message: "denied" } };

    const { result } = renderHook(() => useSoftDeleteClientNote(), { wrapper });

    await expect(
      result.current.mutateAsync({ id: "n1", clientId: "c1" })
    ).rejects.toBeTruthy();
  });
});
