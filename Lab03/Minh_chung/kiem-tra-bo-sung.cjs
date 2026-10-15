// Kiểm tra độc lập qua HTTP, không import hàm lọc PHP để tạo kết quả mong đợi.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.LAB03_TEST_URL || 'http://127.0.0.1:8103';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const log = [`TARGET=${base}`, 'Independent HTTP/browser regression audit'];
  let cases = 0;
  function pass(name) { cases++; log.push(`PASS ${name}`); }
  function healthy(html) {
    assert.doesNotMatch(html, /(?:Fatal error|Warning|Notice|Parse error):/);
  }
  try {
    // Bảng kỳ vọng cố định theo đề, giao của các tập ID kiểm tra đủ tổ hợp AND.
    const keywords = [['', [1, 2, 3]], ['php', [1]], ['PHP', [1]], ['Git', [3]], ['Design', [2]], ['xyz', []], ['  php  ', [1]]];
    const categories = [['', [1, 2, 3]], ['tech', [1, 3]], ['design', [2]], ['unknown', []]];
    for (const [q, qIds] of keywords) {
      for (const [category, categoryIds] of categories) {
        for (const available of ['', '1']) {
          const params = new URLSearchParams({ q, category, available });
          const expected = qIds.filter(id => categoryIds.includes(id) && (available !== '1' || id !== 2));
          const response = await context.request.get(`${base}/?${params}`);
          assert.equal(response.status(), 200);
          const html = await response.text(); healthy(html);
          const ids = [...html.matchAll(/href="\/event\.php\?id=(\d+)"/g)].map(m => Number(m[1]));
          assert.deepEqual(ids, expected);
          assert.ok(html.includes(`Kết quả: ${expected.length}`));
          pass(`filter-matrix ${params} => [${ids}]`);
        }
      }
    }
    for (const query of ['q[a][b]=php', 'category[a][b]=tech', 'available[a][b]=1', 'q=%FF%FE', 'category=%FF%FE', 'q=%00', 'available=true', 'available=2']) {
      const response = await context.request.get(`${base}/?${query}`);
      assert.equal(response.status(), 200); healthy(await response.text());
      pass(`malformed-get ${query}`);
    }
    const valid = { event_id: '3', name: 'Demo', email: 'demo@example.test' };
    const forms = [
      ['empty-post', {}, ['EVENT_INVALID', 'NAME_INVALID', 'EMAIL_INVALID']],
      ['spaces-name', { ...valid, name: ' \t ' }, ['NAME_INVALID']],
      ['name-120-bytes', { ...valid, name: 'a'.repeat(120) }, []],
      ['name-121-bytes', { ...valid, name: 'a'.repeat(121) }, ['NAME_INVALID']],
      ['unicode-name', { ...valid, name: 'Nguyễn Văn An' }, []],
      ['unicode-byte-limit', { ...valid, name: 'ế'.repeat(41) }, ['NAME_INVALID']],
      ['nul-inside-name', { ...valid, name: 'De\0mo' }, ['NAME_INVALID']],
      ['missing-email', { event_id: '1', name: 'Demo' }, ['EMAIL_INVALID']],
      ['long-email', { ...valid, email: 'a'.repeat(201) + '@example.test' }, ['EMAIL_INVALID']],
      ['negative-event', { ...valid, event_id: '-1' }, ['EVENT_INVALID']],
      ['fraction-event', { ...valid, event_id: '1.5' }, ['EVENT_INVALID']],
      ['overflow-event', { ...valid, event_id: '9'.repeat(100) }, ['EVENT_INVALID']],
      ['nested-name', { event_id: '1', 'name[a][b]': 'Demo', email: valid.email }, ['NAME_INVALID']],
      ['full-event-preview-as-specified', { ...valid, event_id: '2' }, []],
    ];
    for (const [name, form, errors] of forms) {
      const response = await context.request.post(base + '/register.php', { form });
      assert.equal(response.status(), 200);
      const html = await response.text(); healthy(html);
      const actualErrors = html.match(/class="error-messages">([^<]*)<\/p>/)?.[1].split(', ') || [];
      assert.deepEqual(actualErrors, errors);
      assert.equal(html.includes('PREVIEW_OK'), errors.length === 0);
      assert.equal(response.headers()['set-cookie'], undefined);
      pass(`post ${name}`);
    }
    for (const [url, status] of [
      ['/event.php?id=1', 200], ['/event.php?id=2', 200], ['/event.php?id=3', 200],
      ['/event.php?id=999', 404], ['/event.php?id[]=1', 404],
      ['/ticket-preview.php?id=1', 404], ['/ticket-preview.php?id[]=demo-open-source', 404],
    ]) {
      const response = await context.request.get(base + url);
      assert.equal(response.status(), status); healthy(await response.text());
      pass(`related-route ${url} HTTP ${status}`);
    }
    await page.goto(base + '/?category=design&available=1');
    await page.locator('#available').uncheck();
    await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Tìm', exact: true }).click()]);
    assert.deepEqual((await page.locator('.event-title').allTextContents()).map(t => t.trim()), ['Design Workshop']);
    assert.equal(new URL(page.url()).searchParams.has('available'), false);
    pass('unchecked-checkbox-omitted-and-full-event-visible');
    await page.goto(base + '/register.php');
    await page.locator('#event_id').selectOption('3');
    await page.locator('#name').fill('Nguyễn Văn An');
    await page.locator('#email').fill('demo@example.test');
    await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()]);
    assert.ok((await page.locator('.status-message').innerText()).includes('PREVIEW_OK: Nguyễn Văn An'));
    assert.equal(await page.locator('#event_id').inputValue(), '3');
    pass('no-javascript-submit-vietnamese-form');
    await page.goto(base + '/register.php');
    assert.equal(await page.locator('.preview,.error-summary').count(), 0);
    assert.equal(await page.locator('#name').inputValue(), '');
    assert.deepEqual(await context.cookies(), []);
    pass('fresh-get-no-persisted-registration');
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/?category=' + 'unknown'.repeat(100));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      await page.goto(base + '/register.php');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      pass(`responsive-list-and-form-${width}px`);
    }
    log.push(`AUDIT_CASES=${cases} FAILED=0`);
    fs.writeFileSync(path.join(__dirname, 'ket-qua-kiem-tra-lai.txt'), log.join('\n') + '\n');
    console.log(log.slice(-8).join('\n'));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
