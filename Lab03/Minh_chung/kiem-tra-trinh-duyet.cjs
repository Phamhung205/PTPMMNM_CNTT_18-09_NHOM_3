// Công cụ kiểm chứng tùy chọn: npm install playwright; máy có Microsoft Edge.
// Khởi động PHP ở 127.0.0.1:8103, rồi chạy node kiem-tra-trinh-duyet.cjs.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  const log = [];
  let count = 0;
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    // Bản mẫu không có favicon; ghi nhận riêng, vẫn bắt mọi lỗi tài nguyên khác.
    if (m.location().url === 'http://127.0.0.1:8103/favicon.ico' && m.text().includes('404')) {
      log.push('NOTE original-template favicon.ico HTTP 404 (cosmetic, outside Lab03 requirements)');
    } else errors.push(`${m.location().url}: ${m.text()}`);
  });
  page.on('requestfailed', r => errors.push(r.url()));
  const check = (actual, expected, name) => {
    assert.deepEqual(actual, expected, name);
    count++; log.push(`PASS ${name}`);
  };
  const base = 'http://127.0.0.1:8103';
  const titles = () => page.locator('.event-title').allTextContents();
  const shot = name => page.screenshot({ path: path.join(__dirname, name), fullPage: true });
  try {
    for (const [query, expected] of [
      ['', ['PHP Open Day', 'Design Workshop', 'Git Clinic']],
      ['?q=php', ['PHP Open Day']], ['?q=xyz', []],
      ['?category=tech', ['PHP Open Day', 'Git Clinic']],
      ['?available=1', ['PHP Open Day', 'Git Clinic']],
      ['?q=Git&category=tech&available=1', ['Git Clinic']],
      ['?category=design&available=1', []], ['?category=unknown', []],
      ['?q=PHP&category=design', []],
      ['?q[]=php&category[]=tech&available[]=1', ['PHP Open Day', 'Design Workshop', 'Git Clinic']],
      ['?available=0', ['PHP Open Day', 'Design Workshop', 'Git Clinic']],
      ['?q=%20php%20', ['PHP Open Day']],
    ]) {
      const response = await page.goto(base + '/' + query);
      check(response.status(), 200, `HTTP GET /${query}`);
      check((await titles()).map(x => x.trim()), expected, `results /${query}`);
    }
    await page.goto(base);
    await page.locator('#q').fill('Git');
    await page.locator('#category').selectOption('tech');
    await page.locator('#available').check();
    await Promise.all([page.waitForURL('**/?q=Git&category=tech&available=1'), page.getByRole('button', { name: 'Tìm', exact: true }).click()]);
    check((await titles()).map(x => x.trim()), ['Git Clinic'], 'submit-combined-form');
    check(await page.locator('#q').inputValue(), 'Git', 'retain-keyword');
    check(await page.locator('#category').inputValue(), 'tech', 'retain-category');
    check(await page.locator('#available').isChecked(), true, 'retain-checkbox');
    await shot('01-bo-loc-ket-hop.png');
    await page.locator('#q').fill('');
    await page.locator('#category').selectOption('design');
    await Promise.all([page.waitForURL('**/?q=&category=design&available=1'), page.getByRole('button', { name: 'Tìm', exact: true }).click()]);
    check(await page.locator('.empty-state').isVisible(), true, 'empty-state-visible');
    await shot('02-khong-co-ket-qua.png');
    await page.getByRole('link', { name: 'Xóa bộ lọc' }).click();
    check(await page.locator('.event-title').count(), 3, 'reset-filters');
    const htmlInput = '\"><script>window.labInjected=true</script>';
    await page.goto(base + '/?q=' + encodeURIComponent(htmlInput) + '&category=' + encodeURIComponent(htmlInput));
    check(await page.locator('#q').inputValue(), htmlInput, 'escape-query-preserves-text');
    check(await page.locator('#category').inputValue(), htmlInput, 'unknown-category-preserves-text');
    check(await page.evaluate(() => window.labInjected), undefined, 'no-script-injection');
    await page.goto(base + '/register.php');
    check(await page.locator('.preview,.error-summary').count(), 0, 'initial-get-has-no-result');
    await page.locator('#event_id').selectOption('3');
    await page.locator('#email').fill('bad');
    await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()]);
    check(await page.locator('.error-messages').textContent(), 'NAME_INVALID, EMAIL_INVALID', 'server-validation-errors');
    check(await page.locator('#event_id').inputValue(), '3', 'retain-event-after-error');
    check(await page.locator('#email').inputValue(), 'bad', 'retain-email-after-error');
    check(await page.locator('.preview').count(), 0, 'invalid-no-preview');
    await shot('03-form-bao-loi.png');
    await page.locator('#name').fill("O'Neil");
    await page.locator('#email').fill(' DEMO@EXAMPLE.TEST ');
    await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()]);
    check((await page.locator('.status-message').textContent()).replace(/\s+/g, ' ').trim(), "PREVIEW_OK: O'Neil — demo@example.test", 'valid-preview-normalization');
    await shot('04-preview-ok.png');
    await page.locator('#name').fill('<b>Demo</b>');
    await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()]);
    check(await page.locator('.preview b').count(), 0, 'preview-does-not-create-html-tag');
    check((await page.locator('.status-message').textContent()).includes('<b>Demo</b>'), true, 'preview-literal-html-text');
    await shot('05-ky-tu-html.png');
    for (const id of ['999', 'demo-open-source']) {
      const response = await context.request.post(base + '/register.php', { form: { event_id: id, name: 'Demo', email: 'demo@example.test' } });
      const html = await response.text();
      check(response.status(), 200, `invalid-id-http-${id}`);
      check(html.includes('EVENT_INVALID') && !html.includes('PREVIEW_OK'), true, `reject-id-${id}`);
    }
    const arrayResponse = await context.request.post(base + '/register.php', { form: { 'event_id[]': '1', 'name[]': 'Demo', 'email[]': 'demo@example.test' } });
    check((await arrayResponse.text()).includes('EVENT_INVALID, NAME_INVALID, EMAIL_INVALID'), true, 'array-post-safe');
    check(await context.cookies(), [], 'no-session-or-cookie-created');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/?q=Git&category=tech&available=1');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'mobile-no-horizontal-overflow');
    await shot('06-giao-dien-mobile.png');
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await noJs.newPage();
    await noJsPage.goto(base + '/?q=Git&category=tech&available=1');
    check(await noJsPage.locator('.event-title').count(), 1, 'filter-without-javascript');
    await noJs.close();
    check(errors, [], 'no-application-console-or-network-errors');
    log.push(`BROWSER_CHECKS=${count} FAILED=0`);
    fs.writeFileSync(path.join(__dirname, 'ket-qua-trinh-duyet.txt'), log.join('\n') + '\n');
    console.log(log.join('\n'));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
