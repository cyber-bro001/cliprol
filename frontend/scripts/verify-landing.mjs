import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve('dist');
const artifacts = resolve('node_modules/.cache/landing-review');
await mkdir(artifacts, { recursive: true });
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!path.startsWith(root + sep) && path !== root) { res.writeHead(403).end(); return; }
  const mime = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.html': 'text/html' };
  try {
    const data = await readFile(path);
    res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
    res.end(data);
  } catch {
    if (extname(path)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', 'text/html');
    res.end(await readFile(resolve(root, 'index.html')));
  }
});
await new Promise(done => server.listen(4178, '127.0.0.1', done));
const browser = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9228',
  `--user-data-dir=${resolve(artifacts, 'browser-profile')}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
const delay = ms => new Promise(done => setTimeout(done, ms));
let socket;
try {
  let targets;
  for (let i = 0; i < 100; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9228/json/list')).json(); if (targets.length) break; } catch {}
    await delay(100);
  }
  assert(targets?.length, 'Browser debugging endpoint unavailable');
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(done => socket.addEventListener('open', done, { once: true }));
  let sequence = 0;
  const pending = new Map();
  const exceptions = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const callback = pending.get(message.id); pending.delete(message.id); callback?.(message); }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise((done, fail) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); fail(new Error(`Timed out: ${method}`)); }, 10000);
    pending.set(id, message => { clearTimeout(timeout); message.error ? fail(new Error(JSON.stringify(message.error))) : done(message.result); });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async expression => {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await delay(100); }
    throw new Error(`Condition not reached: ${expression}`);
  };
  const screenshot = async name => {
    const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(resolve(artifacts, `${name}.png`), Buffer.from(result.data, 'base64'));
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:4178/' });
  await waitFor(`document.querySelectorAll('.hero-transformation img').length === 3 && [...document.querySelectorAll('.hero-transformation img')].every(img => img.complete && img.naturalWidth > 0)`);

  for (const [name, width, height] of [['desktop', 1440, 900], ['laptop', 1280, 800], ['tablet', 820, 1180], ['mobile', 390, 844], ['small-mobile', 320, 740]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await delay(150);
    const state = await evaluate(`({
      scrollWidth: document.documentElement.scrollWidth,
      headings: document.querySelectorAll('h1').length,
      phase: document.querySelector('.hero-transformation').dataset.phase,
      imageCount: document.querySelectorAll('.hero-transformation img').length,
      stageControls: document.querySelectorAll('.hero-transformation button').length,
      mediaBounds: [...document.querySelectorAll('.source-media, .emerging-clip')].map(el => { const r = el.getBoundingClientRect(); return {left:r.left, right:r.right, bottom:r.bottom, top:r.top}; }),
      borderWidth: getComputedStyle(document.querySelector('.hero-transformation')).borderTopWidth,
      background: getComputedStyle(document.querySelector('.hero-transformation')).backgroundColor,
      headlineColor: getComputedStyle(document.querySelector('h1')).color
    })`);
    assert(state.scrollWidth <= width, `${name}: horizontal overflow`);
    assert.equal(state.headings, 1);
    assert.equal(state.phase, 'hold');
    assert.equal(state.imageCount, 3);
    assert.equal(state.stageControls, 0);
    assert.equal(state.borderWidth, '0px');
    assert.equal(state.background, 'rgba(0, 0, 0, 0)');
    assert.equal(state.headlineColor, 'rgb(232, 224, 212)');
    for (const bounds of state.mediaBounds) {
      assert(bounds.left >= 0 && bounds.right <= width, `${name}: media overflows horizontally`);
      assert(bounds.top >= 0 && bounds.bottom <= height, `${name}: result outside first viewport (${bounds.bottom})`);
    }
    await screenshot(name);
    console.log(`${name}: three images inside first viewport, neutral headline, unframed stage, reduced-motion result passed`);
  }

  await evaluate('document.querySelector("#menu-toggle").click(); document.querySelector("#menu-toggle").focus()');
  assert.equal(await evaluate('document.querySelector("#menu-toggle").getAttribute("aria-expanded")'), 'true');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  assert.equal(await evaluate('document.querySelector("#menu-toggle").getAttribute("aria-expanded")'), 'false');
  await evaluate('document.querySelector(".header-cta").click()');
  assert.equal(await evaluate('document.activeElement.type'), 'url');
  await evaluate(`window.scrollTo(0, 0); document.querySelector('.hero-copy').style.visibility = 'hidden'`);
  await screenshot('mobile-copy-hidden');

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Page.reload');
  await waitFor(`document.querySelector('.hero-transformation')?.dataset.running === 'true'`);
  const sourceHandle = await evaluate(`window.reviewSource = document.querySelector('.source-media img'); true`);
  assert(sourceHandle);
  await delay(2600);
  assert.equal(await evaluate('document.querySelector(".hero-transformation").dataset.phase'), 'hold');
  assert.equal(await evaluate('window.reviewSource === document.querySelector(".source-media img")'), true);
  assert.equal(await evaluate('document.querySelectorAll(".hero-transformation button").length'), 1);
  await evaluate(`document.querySelector('.hero-copy').style.visibility = 'hidden'; document.querySelector('.motion-control').click()`);
  await screenshot('desktop-copy-hidden');
  assert.equal(await evaluate('document.querySelector(".hero-transformation").dataset.running'), 'false');
  await delay(300);
  await evaluate('document.querySelector(".motion-control").click()');
  await waitFor(`document.querySelector('.hero-transformation').dataset.scenario === 'podcast'`);
  await waitFor(`document.querySelector('.hero-transformation').dataset.phase === 'hold'`);
  await screenshot('podcast');
  await waitFor(`document.querySelector('.hero-transformation').dataset.scenario === 'coaching'`);
  await waitFor(`document.querySelector('.hero-transformation').dataset.phase === 'hold'`);
  await screenshot('coaching');
  await evaluate(`document.querySelector('#whycliprol').scrollIntoView({block:'start', behavior:'instant'})`);
  await waitFor(`document.querySelector('#whycliprol').dataset.running === 'true' && document.querySelector('.moment-next-preview img').complete`);
  const upcomingPath = await evaluate(`document.querySelector('.moment-next-preview img').getAttribute('src')`);
  await screenshot('moment-preview-desktop');
  await evaluate(`document.querySelector('[aria-label="Next moment"]').click(); document.querySelector('[aria-label="Next moment"]').click(); document.querySelector('[aria-label="Next moment"]').click()`);
  await delay(700);
  assert.equal(await evaluate(`document.querySelector('.moment-clip img').getAttribute('src')`), upcomingPath);
  assert.equal(await evaluate(`document.querySelector('.moment-reason p').textContent`), 'An expressive gesture draws attention to the speaker’s point.');
  await screenshot('moment-next-desktop');
  await evaluate(`window.readyImage = document.querySelector('.ready-clip img'); document.querySelector('#ready-to-share').scrollIntoView({block:'start', behavior:'instant'})`);
  await waitFor(`document.querySelector('.ready-stage').dataset.running === 'true' && document.querySelector('.ready-clip img').complete && document.querySelector('.ready-clip img').naturalWidth > 0`);
  await screenshot('ready-enter');
  await delay(5700);
  assert.equal(await evaluate(`window.readyImage === document.querySelector('.ready-clip img')`), true);
  assert.equal(await evaluate(`document.querySelectorAll('.ready-viewer').length`), 3);
  assert.equal(await evaluate(`document.querySelector('.ready-viewer[data-position="0"] img').getAttribute('src')`), '/media/landing/showcase/lady-podcast.webp');
  await evaluate(`document.querySelector('[aria-label="Pause ready-to-share rotation"]').click()`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.ready-viewer'), '::before').opacity`), '1');
  await evaluate(`document.querySelector('#ready-heading').style.visibility = 'hidden'`);
  await screenshot('ready-copy-hidden');
  await evaluate(`document.querySelector('#faq').scrollIntoView({block:'start', behavior:'instant'}); document.querySelector('#faq-question-1').click()`);
  assert.equal(await evaluate(`document.querySelector('#faq-question-1').getAttribute('aria-expanded')`), 'true');
  assert.equal(await evaluate(`document.querySelector('#faq-answer-1').hidden`), false);
  assert.equal(await evaluate(`[...document.querySelectorAll('.site-header a[href^="#"], .site-footer a[href^="#"]')].every(a => document.querySelector(a.getAttribute('href')))`), true);
  assert.equal(await evaluate(`document.querySelector('#howitworks') === null`), true);
  assert.equal(await evaluate(`document.querySelector('.final-cta').nextElementSibling === null && document.querySelector('main').nextElementSibling.classList.contains('site-footer')`), true);
  for (const [name, width, height] of [['desktop',1440,900], ['tablet',820,1180], ['mobile',390,844], ['small-mobile',320,740]]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor:1, mobile:false});
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:'reduce'}]});
    await evaluate(`document.querySelector('#ready-to-share').scrollIntoView({block:'start', behavior:'instant'})`);
    await delay(150);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `${name}: lower-page overflow`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.ready-viewer')).animationName`), 'none');
    await screenshot(`ready-${name}`);
    await evaluate(`document.querySelector('#whycliprol').scrollIntoView({block:'start', behavior:'instant'})`);
    await screenshot(`moment-static-${name}`);
    await evaluate(`document.querySelector('.final-cta').scrollIntoView({block:'start', behavior:'instant'})`);
    await screenshot(`final-${name}`);
  }
  await evaluate(`document.querySelector('.final-cta a').click()`);
  assert.equal(await evaluate(`document.activeElement.type`), 'url');
  await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:'no-preference'}]});
  await evaluate(`document.querySelector('#whycliprol').scrollIntoView({block:'start', behavior:'instant'})`);
  await waitFor(`document.querySelector('.moment-example').dataset.transitioning === 'false' && document.querySelector('#whycliprol').dataset.running === 'true'`);
  await evaluate(`document.querySelector('[aria-label="Pause moment showcase"]').click()`);
  await screenshot('moment-preview-small-mobile');
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true);
  console.log('Lower sections: persistent ready-to-share clip, completed phone context, reduced motion, four viewport widths, FAQ disclosure, valid anchors, CTA placement and shared-input focus passed.');
  assert.equal(exceptions.length, 0, exceptions.join('\n'));
  console.log('Animation reaches hold in 2.4 seconds, source node persists, pause/resume, scenario cycle, keyboard menu, and CTA focus passed.');
  console.log('Screenshots: node_modules/.cache/landing-review');
  await send('Browser.close');
} finally {
  socket?.close();
  browser.kill();
  server.close();
}
