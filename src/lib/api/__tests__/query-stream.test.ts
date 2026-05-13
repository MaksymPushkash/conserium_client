import { describe, expect, it } from "vitest";

import { parseQueryStreamEvent } from "@/lib/api/query";

describe("query stream parser", () => {
  it("parses SSE data events", () => {
    expect(parseQueryStreamEvent('event: token\ndata: {"event":"token","data":{"text":"hello"}}')).toEqual({
      event: "token",
      data: { text: "hello" },
    });
  });

  it("ignores done sentinels", () => {
    expect(parseQueryStreamEvent("data: [DONE]")).toBeNull();
  });
});
