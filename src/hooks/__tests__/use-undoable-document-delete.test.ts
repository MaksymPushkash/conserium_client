import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUndoableDocumentDelete } from "@/hooks/use-undoable-document-delete";

describe("useUndoableDocumentDelete", () => {
  it("delays deletion and supports undo", () => {
    vi.useFakeTimers();
    const onDeleteOne = vi.fn();
    const onDeleteMany = vi.fn();
    const { result } = renderHook(() => useUndoableDocumentDelete({ onDeleteOne, onDeleteMany }));

    act(() => result.current.scheduleDelete(["doc-1"], "doc will be deleted"));
    expect(result.current.pendingDelete?.label).toBe("doc will be deleted");

    act(() => result.current.undoDelete());
    act(() => vi.advanceTimersByTime(5000));

    expect(onDeleteOne).not.toHaveBeenCalled();
    expect(onDeleteMany).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("runs bulk delete after the undo window", () => {
    vi.useFakeTimers();
    const onDeleteOne = vi.fn();
    const onDeleteMany = vi.fn();
    const { result } = renderHook(() => useUndoableDocumentDelete({ onDeleteOne, onDeleteMany }));

    act(() => result.current.scheduleDelete(["doc-1", "doc-2"], "2 documents will be deleted"));
    act(() => vi.advanceTimersByTime(5000));

    expect(onDeleteMany).toHaveBeenCalledWith(["doc-1", "doc-2"]);
    expect(onDeleteOne).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
