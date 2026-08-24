import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");

const AUTH = {
  state: {
    user: {
      id: "usr_james",
      name: "James Whitmore",
      email: "oscar.d@example.net",
      role: "owner",
      agentId: "agt_01",
      workspaceId: "ws_meridian",
      avatarUrl: "https://i.pravatar.cc/256?img=12",
    },
  },
  version: 0,
};

async function waitForImages(page) {
  await page.waitForFunction(
    () => {
      const imgs = [...document.images];
      if (!imgs.length) return true;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    { timeout: 20000 },
  ).catch(() => {});
  await page.waitForTimeout(400);
}

async function shot(page, name) {
  await waitForImages(page);
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    animations: "disabled",
  });
  console.log(`wrote ${name}.png`);
}

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

const publicContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const publicPage = await publicContext.newPage();

await publicPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await publicPage.getByRole("heading", { name: /inventory like editorial/i }).waitFor();
await shot(publicPage, "01-landing");

await publicPage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await publicPage.getByRole("heading", { name: "Sign in" }).waitFor();
await shot(publicPage, "02-login");
await publicContext.close();

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await context.addInitScript((auth) => {
  localStorage.setItem("proppilot-auth", JSON.stringify(auth));
}, AUTH);
const page = await context.newPage();

await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.getByText("Active listings").waitFor({ timeout: 20000 });
await shot(page, "03-dashboard");

await page.goto(`${BASE}/properties`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Properties" }).waitFor();
await shot(page, "04-properties");

await page.goto(`${BASE}/properties/prp_01`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Mayfair Residence" }).waitFor();
await shot(page, "05-property");

await page.goto(`${BASE}/leads`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Leads" }).waitFor();
await shot(page, "06-leads");

await page.goto(`${BASE}/leads/led_01`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Helena Crowe" }).waitFor();
await shot(page, "07-lead");

await page.goto(`${BASE}/analytics`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Analytics" }).waitFor();
await shot(page, "08-analytics");

await page.goto(`${BASE}/calendar`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Calendar" }).waitFor();
await shot(page, "09-calendar");

await browser.close();
