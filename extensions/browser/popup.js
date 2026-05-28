const fields = {
  apiOrigin: document.querySelector("#apiOrigin"),
  apiKey: document.querySelector("#apiKey"),
  collectionId: document.querySelector("#collectionId"),
  tags: document.querySelector("#tags"),
  status: document.querySelector("#status"),
  savePage: document.querySelector("#savePage"),
  saveSelection: document.querySelector("#saveSelection"),
  history: document.querySelector("#history"),
};

chrome.storage.local.get(["apiOrigin", "apiKey", "collectionId", "tags", "saveHistory"], async (values) => {
  fields.apiOrigin.value = values.apiOrigin || "https://api.conserium.app/api/v1";
  fields.apiKey.value = values.apiKey || "";
  fields.tags.value = values.tags || "";
  renderHistory(values.saveHistory || []);
  await loadCollections(values.collectionId || "");
});

for (const key of ["apiOrigin", "apiKey", "collectionId", "tags"]) {
  fields[key].addEventListener("input", () => {
    chrome.storage.local.set({ [key]: fields[key].value.trim() });
  });
}

fields.apiOrigin.addEventListener("change", () => loadCollections(fields.collectionId.value));
fields.apiKey.addEventListener("change", () => loadCollections(fields.collectionId.value));
fields.savePage.addEventListener("click", () => saveCurrentTab(false));
fields.saveSelection.addEventListener("click", () => saveCurrentTab(true));

async function loadCollections(selectedId) {
  const origin = normalizedOrigin();
  const apiKey = normalizedApiKey();
  fields.collectionId.innerHTML = '<option value="">All collections</option>';
  if (!origin || !apiKey) return;
  try {
    const response = await fetch(`${origin}/public-api/collections`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        fields.status.textContent = "API key needs collections:read to load collections.";
      }
      return;
    }
    const body = await response.json();
    for (const collection of body.items || []) {
      const option = document.createElement("option");
      option.value = collection.id;
      option.textContent = collection.name;
      option.selected = collection.id === selectedId;
      fields.collectionId.appendChild(option);
    }
  } catch (_error) {
    return;
  }
}

async function saveCurrentTab(selectionOnly) {
  const origin = normalizedOrigin();
  const apiKey = normalizedApiKey();
  if (!origin) {
    setBusy(false, "Enter a valid Conserium API origin.");
    return;
  }
  if (!apiKey) {
    setBusy(false, "Enter a Conserium API key.");
    return;
  }

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
    const response = await fetch(`${origin}/public-api/ingest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
    const title = body.document?.title || body.intake_item.title;
    await recordSave({ title, status: body.intake_item.status, savedAt: new Date().toISOString() });
    setBusy(false, `Queued ${title}`);
  } catch (error) {
    setBusy(false, error instanceof Error ? error.message : "Save failed");
  }
}

async function recordSave(item) {
  const values = await chrome.storage.local.get(["saveHistory"]);
  const history = [item, ...(values.saveHistory || [])].slice(0, 8);
  await chrome.storage.local.set({ saveHistory: history });
  renderHistory(history);
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

function renderHistory(history) {
  fields.history.innerHTML = "";
  if (!history.length) {
    const empty = document.createElement("li");
    empty.textContent = "No saved items yet";
    fields.history.appendChild(empty);
    return;
  }
  for (const item of history) {
    const row = document.createElement("li");
    row.textContent = item.title || "Saved item";
    const meta = document.createElement("span");
    meta.textContent = `${String(item.status || "queued").toLowerCase()} · ${new Date(item.savedAt).toLocaleString()}`;
    row.appendChild(meta);
    fields.history.appendChild(row);
  }
}

function normalizedOrigin() {
  const value = fields.apiOrigin.value.trim().replace(/\/$/, "");
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return value;
  } catch (_error) {
    return null;
  }
}

function normalizedApiKey() {
  const value = fields.apiKey.value.trim();
  return value.startsWith("ctx_") ? value : null;
}

function hash(value) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }
  return Math.abs(output).toString(36);
}
