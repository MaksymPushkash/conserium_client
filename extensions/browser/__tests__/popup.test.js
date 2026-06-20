import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Conserium browser extension popup", () => {
  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = popupHtml();
    global.chrome = chromeMock();
    global.fetch = vi.fn(async () => jsonResponse({ items: [] }));
    await import("../popup.js");
  });

  it("validates API origins", () => {
    const helpers = window.__conseriumClipper;

    expect(helpers.normalizeOrigin("https://api.conserium.app/api/v1/")).toBe("https://api.conserium.app/api/v1");
    expect(helpers.normalizeOrigin("http://localhost:8000/api/v1")).toBe("http://localhost:8000/api/v1");
    expect(helpers.normalizeOrigin("ftp://api.conserium.app")).toBeNull();
    expect(helpers.normalizeOrigin("not a url")).toBeNull();
  });

  it("validates Conserium API keys and rejects legacy ctx keys", () => {
    const helpers = window.__conseriumClipper;

    expect(helpers.normalizeApiKey("con_live_key")).toBe("con_live_key");
    expect(helpers.normalizeApiKey("ctx_legacy_key")).toBeNull();
    expect(helpers.isLegacyApiKey("ctx_legacy_key")).toBe(true);
    expect(helpers.normalizeApiKey("bad_key")).toBeNull();
  });

  it("loads collections with collections:read keys", async () => {
    const collectionSelect = document.querySelector("#collectionId");
    global.fetch = vi.fn(async () =>
      jsonResponse({
        items: [
          { id: "collection-1", name: "Research" },
          { id: "collection-2", name: "Inbox" },
        ],
      }),
    );

    document.querySelector("#apiOrigin").value = "https://api.conserium.app/api/v1";
    document.querySelector("#apiKey").value = "con_live_key";
    document.querySelector("#apiKey").dispatchEvent(new Event("change"));
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith("https://api.conserium.app/api/v1/public-api/collections", {
      headers: { Authorization: "Bearer con_live_key" },
    });
    expect([...collectionSelect.options].map((option) => option.textContent)).toEqual([
      "All collections",
      "Research",
      "Inbox",
    ]);
  });

  it("builds public ingest payloads for selected text", () => {
    const helpers = window.__conseriumClipper;
    const payload = helpers.buildIngestPayload({
      tab: { id: 7, title: "Architecture Notes", url: "https://example.com/article" },
      selectedText: "  Policy should not depend on details.  ",
      collectionId: "collection-1",
      tags: "architecture, clean ",
    });

    expect(payload).toMatchObject({
      title: "Architecture Notes",
      type: "MARKDOWN",
      raw_content: "Policy should not depend on details.",
      source_url: "https://example.com/article",
      provider: "browser-extension",
      collection_id: "collection-1",
      tags: ["architecture", "clean"],
      metadata: { browser_title: "Architecture Notes" },
    });
    expect(payload.external_id).toMatch(/^7:https:\/\/example.com\/article:/);
    expect(payload.idempotency_key).toMatch(/^https:\/\/example.com\/article:/);
  });

  it("validates collection selections against loaded options", () => {
    const helpers = window.__conseriumClipper;

    expect(helpers.validateCollectionSelection("collection-1", ["", "collection-1"])).toBe("collection-1");
    expect(helpers.validateCollectionSelection("missing", ["", "collection-1"])).toBe("");
    expect(helpers.validateCollectionSelection("", ["", "collection-1"])).toBe("");
  });

  it("sends public ingest payloads when saving the current page", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        intake_item: { title: "Saved Page", status: "queued" },
        document: { title: "Saved Page" },
      }),
    );
    global.fetch = fetchMock;
    global.chrome.tabs.query.mockResolvedValue([{ id: 9, title: "Saved Page", url: "https://example.com/page" }]);

    document.querySelector("#apiOrigin").value = "https://api.conserium.app/api/v1";
    document.querySelector("#apiKey").value = "con_live_key";
    document.querySelector("#collectionId").value = "";
    document.querySelector("#tags").value = "web";
    document.querySelector("#savePage").click();
    await flushPromises();

    const [, request] = fetchMock.mock.calls[0];
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.conserium.app/api/v1/public-api/ingest");
    expect(JSON.parse(request.body)).toMatchObject({
      title: "Saved Page",
      type: "URL",
      source_url: "https://example.com/page",
      provider: "browser-extension",
      collection_id: null,
      tags: ["web"],
    });
    expect(global.chrome.storage.local.set).toHaveBeenLastCalledWith({
      saveHistory: [
        expect.objectContaining({
          title: "Saved Page",
          url: "https://example.com/page",
          collectionId: "",
          status: "queued",
        }),
      ],
    });
  });
});

function popupHtml() {
  return `
    <input id="apiOrigin" />
    <input id="apiKey" />
    <select id="collectionId"><option value="">All collections</option></select>
    <input id="tags" />
    <p id="status"></p>
    <button id="savePage"></button>
    <button id="saveSelection"></button>
    <ul id="history"></ul>
  `;
}

function chromeMock() {
  const storage = { saveHistory: [] };
  return {
    storage: {
      local: {
        get: vi.fn(async (keys, callback) => {
          const values = Array.isArray(keys)
            ? Object.fromEntries(keys.map((key) => [key, storage[key]]))
            : storage;
          if (callback) callback(values);
          return values;
        }),
        set: vi.fn(async (values) => {
          Object.assign(storage, values);
        }),
      },
    },
    scripting: {
      executeScript: vi.fn(async () => [{ result: "" }]),
    },
    tabs: {
      query: vi.fn(async () => []),
    },
  };
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
