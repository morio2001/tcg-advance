// 全タブのスクリーンショットを design/screenshots/ に書き出す。
// モックモード（VITE_MOCK_AUTH=1）で dev サーバーを起動するので Supabase 環境変数は不要。
//
//   npm run shots
//
// Chromium の場所は $CHROMIUM_PATH > playwright-core 同梱解決 > /opt/pw-browsers/chromium の順で探す。
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'design', 'screenshots');
const PORT = 5199;
const URL = `http://localhost:${PORT}`;

const TABS = [
  ['ホーム', 'home'],
  ['イベント', 'events'],
  ['戦績', 'battle'],
  ['デッキ', 'deck'],
  ['検索', 'search'],
  ['アカウント', 'account'],
];

function resolveChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  try {
    const p = chromium.executablePath();
    if (p && existsSync(p)) return p;
  } catch { /* playwright-core はブラウザ非同梱なので失敗しうる */ }
  const fallback = '/opt/pw-browsers/chromium';
  if (existsSync(fallback)) return fallback;
  throw new Error('Chromium が見つかりません。CHROMIUM_PATH を設定してください。');
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch { /* まだ起動中 */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`dev サーバーが ${timeoutMs}ms 以内に起動しませんでした`);
}

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  env: { ...process.env, VITE_MOCK_AUTH: '1' },
  stdio: 'ignore',
  detached: true,
});
// detached + プロセスグループごと kill で vite の子プロセスも確実に止める
const stopServer = () => { try { process.kill(-server.pid, 'SIGTERM'); } catch { /* already gone */ } };
process.on('exit', stopServer);

try {
  await waitForServer(URL);
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: resolveChromium(),
    args: ['--no-sandbox'],
  });
  const page = await (await browser.newContext({
    viewport: { width: 430, height: 900 },
    deviceScaleFactor: 2,
  })).newPage();

  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message)));

  await page.goto(URL, { timeout: 30000 });
  await page.waitForTimeout(2500);

  for (const [label, name] of TABS) {
    await page.locator(`button:has-text("${label}")`).last().click();
    await page.waitForTimeout(1000);
    const file = join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: file });
    console.log(`✓ ${file}`);
  }

  await browser.close();
  if (errors.length) {
    console.error('ページエラーあり:\n' + errors.join('\n'));
    process.exitCode = 1;
  }
} finally {
  stopServer();
}
