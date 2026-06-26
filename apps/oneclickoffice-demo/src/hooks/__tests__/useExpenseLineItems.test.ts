import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const captured: { insertedRows: unknown } = { insertedRows: null };

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      insert: vi.fn((rows: unknown) => {
        captured.insertedRows = rows;
        return { select: vi.fn(() => Promise.resolve({ data: rows, error: null })) };
      }),
    })),
  },
}));

import { useReplaceExpenseLineItems } from "../useExpenseLineItems";

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => { captured.insertedRows = null; });

describe("useReplaceExpenseLineItems", () => {
  it("schreibt category in die Insert-Rows", async () => {
    const { result } = renderHook(() => useReplaceExpenseLineItems(), { wrapper });
    result.current.mutate({
      expense_id: "exp-1",
      items: [
        { description: "Essen", amount: 10, banana_category_key: null, category: "Essen" },
      ],
    });
    await waitFor(() => expect(captured.insertedRows).not.toBeNull());
    expect((captured.insertedRows as Array<{ category: string }>)[0].category).toBe("Essen");
  });

  it("schreibt banana_category_key in die Insert-Rows (Banana-Modus)", async () => {
    const { result } = renderHook(() => useReplaceExpenseLineItems(), { wrapper });
    result.current.mutate({
      expense_id: "exp-2",
      items: [
        { description: "Benzin", amount: 50, banana_category_key: "benzin", category: null },
      ],
    });
    await waitFor(() => expect(captured.insertedRows).not.toBeNull());
    const row = (captured.insertedRows as Array<{ banana_category_key: string | null; category: string | null }>)[0];
    expect(row.banana_category_key).toBe("benzin");
    expect(row.category).toBeNull();
  });
});
