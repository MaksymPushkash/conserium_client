import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  webServer: {
    command: process.env.PLAYWRIGHT_DEV_SERVER ? "npm run dev" : "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: Boolean(process.env.PLAYWRIGHT_DEV_SERVER) && !process.env.CI,
    timeout: 180_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
