const fields = {
  apiOrigin: document.querySelector("#apiOrigin"),
  apiKey: document.querySelector("#apiKey"),
  collectionId: document.querySelector("#collectionId"),
  tags: document.querySelector("#tags"),
  status: document.querySelector("#status"),
  savePage: document.querySelector("#savePage"),
  saveSelection: document.querySelector("#saveSelection"),
};

chrome.storage.local.get(["apiOrigin", "apiKey", "collectionId", "tags"], (values) => {
  fields.apiOrigin.value = values.apiOrigin || "https://api.cortexx.me/api/v1";
  fields.apiKey.value = values.apiKey || "";
  fields.collectionId.value = values.collectionId || "";
  fields.tags.value = values.tags || "";
});

for (const key of ["apiOrigin", "apiKey", "collectionId", "tags"]) {
  fields[key].addEventListener("input", () => {
    chrome.storage.local.set({ [key]: fields[key].value.trim() });
  });
}

fields.savePage.addEventListener("click", () => saveCurrentTab(false));
fields.saveSelection.addEventListener("click", () => saveCurrentTab(true));

async function saveCurrentTab(selectionOnly) {
  setBusy(true, "Saving...");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) throw new Error("No active tab");
    const selectedText = selectionOnly ? await getSelection(tab.id) : "";
    const payload = selectedText
      ? {
          title: tab.title || "Browser selection",
          type: "MARKDOWN",
          raw_content: selectedText,
          source_url: tab.url,
        }
      : {
          title: tab.title || tab.url,
          type: tab.url.includes("youtube.com/watch") || tab.url.includes("youtu.be/") ? "YOUTUBE" : "URL",
          source_url: tab.url,
        };
    const response = await fetch(`${fields.apiOrigin.value.replace(/\/$/, "")}/webhooks/ingest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fields.apiKey.value.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        provider: "browser-extension",
        external_id: `${tab.id}:${tab.url}:${selectedText ? hash(selectedText) : "page"}`,
        idempotency_key: `${tab.url}:${selectedText ? hash(selectedText) : "page"}`,
        collection_id: fields.collectionId.value.trim() || null,
        tags: fields.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean),
        metadata: { browser_title: tab.title || null },
      }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.detail || "Save failed");
    setBusy(false, `Queued ${body.document?.title || body.intake_item.title}`);
  } catch (error) {
    setBusy(false, error instanceof Error ? error.message : "Save failed");
  }
}

async function getSelection(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.getSelection()?.toString() || "",
  });
  return result || "";
}

function setBusy(disabled, message) {
  fields.savePage.disabled = disabled;
  fields.saveSelection.disabled = disabled;
  fields.status.textContent = message;
}

function hash(value) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }
  return Math.abs(output).toString(36);
}
