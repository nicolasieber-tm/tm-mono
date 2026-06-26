import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: { access_token: "tok-123" } } }),
      ),
    },
  },
}));

import { useExpenseExport } from "../useExpenseExport";

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
};

const captured: { url?: string; init?: RequestInit } = {};

beforeEach(() => {
  captured.url = undefined;
  captured.init = undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init: RequestInit) => {
      captured.url = url;
      captured.init = init;
      return Promise.resolve(
        new Response(new Blob(["zipdata"]), {
          status: 200,
          headers: { "Content-Disposition": 'attachment; filename="spesen_export_alle.zip"' },
        }),
      );
    }),
  );
  // jsdom kennt createObjectURL nicht -> stubben
  (URL as unknown as { createObjectURL: () => string }).createObjectURL = vi.fn(
    () => "blob:x",
  );
  (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

describe("useExpenseExport", () => {
  it("POSTet an export-expenses mit JWT-Header und Filter-Body", async () => {
    const { result } = renderHook(() => useExpenseExport(), { wrapper });
    result.current.mutate({ date_from: "2026-06-01", date_to: "2026-06-30" });
    await waitFor(() => expect(captured.url).toBeDefined());
    expect(captured.url).toContain("/functions/v1/export-expenses");
    expect((captured.init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok-123",
    );
    expect(JSON.parse(captured.init?.body as string)).toEqual({
      date_from: "2026-06-01",
      date_to: "2026-06-30",
    });
  });
});
