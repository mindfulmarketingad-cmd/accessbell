import { C, svg, text, para, compare, caption, box, field, button, lines, code, arrow, pill, browser, mark } from '../kit.mjs';

const W = 800;
export const images = [];
const add = (slug, name, h, body) => images.push({ slug, name, svg: svg(W, h, body) });

// ---------- 1.3.1 Info and Relationships ----------
{
  const s = '1-3-1-info-and-relationships';
  let { body, a, b } = compare(W, 420, 'Looks right, coded wrong', 'Structure in the code');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += text(x, p.y + 92, 'Opening hours', { size: 20, weight: 800 });
    body += pill(x + 170, p.y + 76, good ? '<h2>' : '<div class="big">', { fill: good ? '#dfeddb' : '#f8dcd9', color: good ? C.pass : C.fail });
    body += text(x, p.y + 130, '• Monday to Friday, 9 to 5', { size: 14 });
    body += text(x, p.y + 154, '• Saturday, 10 to 2', { size: 14 });
    body += pill(x, p.y + 168, good ? '<ul> with <li> items' : 'text with bullet characters', { fill: good ? '#dfeddb' : '#f8dcd9', color: good ? C.pass : C.fail });
    body += text(x, p.y + 224, 'Phone', { size: 14, weight: 700 });
    body += box(x, p.y + 232, w, 34);
    body += pill(x, p.y + 276, good ? '<label for="phone">' : 'text next to a field', { fill: good ? '#dfeddb' : '#f8dcd9', color: good ? C.pass : C.fail });
    body += caption(p.x + p.w / 2, p.y + 340, good ? 'Screen readers announce a heading, a list of 2 items and a labeled phone field' : 'Screen readers hear plain text and an unlabeled field', good ? 'pass' : 'fail');
  }
  add(s, 'visual-vs-code', 420, body);

  let t = compare(W, 380, 'Radio buttons with no group', 'Grouped with fieldset and legend');
  body = t.body;
  for (const [p, good] of [[t.a, false], [t.b, true]]) {
    const x = p.x + 24;
    if (good) body += box(x - 6, p.y + 70, p.w - 36, 168, { fill: 'none', stroke: C.passMid, sw: 2, dash: '6 5', r: 10 }) + text(x + 4, p.y + 94, 'Delivery speed', { size: 15, weight: 800, fill: C.pass });
    else body += text(x, p.y + 94, 'Delivery speed', { size: 15, weight: 800 });
    ['Standard (3 to 5 days)', 'Express (next day)', 'Collect in store'].forEach((o, i) => {
      body += `<circle cx="${x + 12}" cy="${p.y + 128 + i * 34}" r="9" fill="#fff" stroke="${C.muted}" stroke-width="2"/>` + (i === 0 ? `<circle cx="${x + 12}" cy="${p.y + 128 + i * 34}" r="4.5" fill="${C.ink}"/>` : '');
      body += text(x + 32, p.y + 133 + i * 34, o, { size: 14 });
    });
    body += caption(p.x + p.w / 2, p.y + 286, good ? 'Announced: "Delivery speed, group. Standard, radio button, 1 of 3"' : 'Announced: "Standard, radio button". The question is never read out', good ? 'pass' : 'fail');
  }
  add(s, 'form-groups', 380, body);

  t = compare(W, 380, 'A grid of text', 'A real data table');
  body = t.body;
  for (const [p, good] of [[t.a, false], [t.b, true]]) {
    const x = p.x + 24, cw = (p.w - 48) / 3;
    const rows = [['Plan', 'Price', 'Pages'], ['Starter', '$29', '500'], ['Annual', '$199', '500']];
    rows.forEach((r, i) => r.forEach((cell, j) => {
      const head = i === 0;
      body += box(x + j * cw, p.y + 76 + i * 40, cw, 40, { fill: head && good ? '#dfeddb' : '#fff', stroke: C.line, r: 0 });
      body += text(x + j * cw + 12, p.y + 101 + i * 40, cell, { size: 14, weight: head ? 800 : 400 });
    }));
    body += pill(x, p.y + 210, good ? '<th scope="col"> headers' : 'every cell is <td>', { fill: good ? '#dfeddb' : '#f8dcd9', color: good ? C.pass : C.fail });
    body += caption(p.x + p.w / 2, p.y + 280, good ? 'Each price is read with its column header: "Price, $29"' : 'Screen readers read "$29" with no idea what it is', good ? 'pass' : 'fail');
  }
  add(s, 'data-table', 380, body);
}

// ---------- 2.1.1 Keyboard ----------
{
  const s = '2-1-1-keyboard';
  let { body, a, b } = compare(W, 400, 'Tab skips the control', 'Every control is reachable');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    const items = [['Search products', 'field'], ['Add to cart', 'button'], ['Size guide', 'link']];
    items.forEach(([label, kind], i) => {
      const y = p.y + 82 + i * 70;
      const skipped = !good && i === 1;
      if (kind === 'field') body += field(x + 44, y, w - 44, '', { placeholder: label });
      else if (kind === 'button') body += button(x + 44, y, 160, label, { variant: 'primary' });
      else body += text(x + 44, y + 24, label, { size: 15, weight: 600, fill: C.info }) + `<path d="M${x + 44} ${y + 28}H${x + 124}" stroke="${C.info}" stroke-width="1.5"/>`;
      const n = good ? String(i + 1) : skipped ? '–' : String(i === 0 ? 1 : 2);
      body += `<circle cx="${x + 14}" cy="${y + 19}" r="14" fill="${skipped ? C.failMid : C.ink}"/>` + text(x + 14, y + 24, n, { size: 13, weight: 800, fill: '#fff', anchor: 'middle' });
      if (skipped) body += text(x + 214, y + 24, '<div onclick>', { size: 13, weight: 700, fill: C.fail, mono: true });
    });
    body += caption(p.x + p.w / 2, p.y + 316, good ? 'A real <button> is in the tab order and works with Enter and Space' : 'A clickable <div> never gets focus, so keyboard users cannot add to cart', good ? 'pass' : 'fail');
  }
  add(s, 'tab-order', 400, body);

  body = text(24, 40, 'Keys keyboard users rely on', { size: 20, weight: 800 });
  const keys = [['Tab', 'Move to the next control'], ['Shift + Tab', 'Move back'], ['Enter', 'Follow a link, press a button'], ['Space', 'Press a button, tick a checkbox'], ['Arrow keys', 'Menus, radios, sliders, tabs'], ['Esc', 'Close a dialog or menu']];
  keys.forEach(([k, d], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 24 + col * 388, y = 70 + row * 74;
    body += box(x, y, 368, 58, { fill: '#fff', stroke: C.line, r: 12 });
    body += box(x + 12, y + 12, k.length * 9 + 26, 34, { fill: C.soft, stroke: '#b9bfc8', r: 7 }) + text(x + 25 + (k.length * 9) / 2, y + 34, k, { size: 14, weight: 800, anchor: 'middle' });
    body += text(x + k.length * 9 + 52, y + 34, d, { size: 14, fill: C.muted });
  });
  add(s, 'keyboard-keys', 300, body);
}

// ---------- 2.4.1 Bypass Blocks ----------
{
  const s = '2-4-1-bypass-blocks';
  let { body, a, b } = compare(W, 420, 'Tab through every menu link', 'A skip link jumps to the content');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    let y = p.y + 72;
    if (good) {
      body += button(x, y, 190, 'Skip to main content', { variant: 'secondary', focus: true, size: 13 });
      y += 52;
    }
    body += box(x, y, w, 120, { fill: '#fff', stroke: C.line, r: 10 });
    ['Shop', 'Men', 'Women', 'Kids', 'Sale', 'Brands', 'Gifts', 'Help', 'Stores', 'Account', 'Wishlist', 'Cart'].forEach((l, i) => {
      body += text(x + 14 + (i % 4) * ((w - 20) / 4), y + 30 + Math.floor(i / 4) * 34, l, { size: 13, fill: C.info, weight: 600 });
    });
    const my = y + 136;
    body += box(x, my, w, 62, { fill: good ? '#dfeddb' : '#fff', stroke: good ? C.passMid : C.line, sw: good ? 2.5 : 1.5, r: 10 });
    body += text(x + 14, my + 26, 'Main content', { size: 15, weight: 800 }) + lines(x + 14, my + 38, w - 40, 1, { last: 1 });
    if (good) body += `<path d="M${x + 194} ${p.y + 91}H${x + w + 12}V${my + 31}" fill="none" stroke="${C.passMid}" stroke-width="2.5" stroke-linejoin="round"/>` + arrow(x + w + 12, my + 31, x + w + 3, my + 31, C.passMid);
    body += caption(p.x + p.w / 2, p.y + p.h - 34, good ? '1 key press to reach the content' : '12+ key presses on every page before the content', good ? 'pass' : 'fail');
  }
  add(s, 'skip-link', 420, body);

  body = text(24, 40, 'Landmarks let people jump between regions', { size: 20, weight: 800 });
  const reg = [['<header>', 'banner', 70, 50], ['<nav>', 'navigation', 132, 44], ['<main>', 'main', 188, 120], ['<footer>', 'contentinfo', 320, 46]];
  for (const [tag, role, y, h] of reg) {
    body += box(24, y, 470, h, { fill: tag === '<main>' ? '#dfeddb' : C.soft, stroke: tag === '<main>' ? C.passMid : '#b9bfc8', r: 10 });
    body += text(42, y + h / 2 + 5, tag, { size: 15, weight: 800, mono: true }) + text(150, y + h / 2 + 5, `role: ${role}`, { size: 13, fill: C.muted });
  }
  body += box(520, 70, 256, 296, { fill: '#fff', stroke: C.line, r: 12 });
  body += text(538, 100, 'Screen reader landmarks list', { size: 14, weight: 800 });
  ['banner', 'navigation', 'main', 'contentinfo'].forEach((r, i) => {
    body += box(538, 118 + i * 52, 220, 40, { fill: r === 'main' ? '#dfeddb' : C.soft, stroke: r === 'main' ? C.passMid : C.soft, r: 8 }) + text(552, 143 + i * 52, r, { size: 14, weight: 600 });
  });
  add(s, 'landmarks', 390, body);
}

// ---------- 2.4.2 Page Titled ----------
{
  const s = '2-4-2-page-titled';
  let body = '';
  const tabs = (y, labels, good) => {
    let out = '';
    labels.forEach((l, i) => {
      const x = 24 + i * 252;
      out += `<path d="M${x} ${y + 44}V${y + 12}a10 10 0 0 1 10-10h220a10 10 0 0 1 10 10V${y + 44}" fill="${i === 1 ? '#fff' : C.soft}" stroke="${C.line}" stroke-width="1.5"/>`;
      out += `<rect x="${x + 14}" y="${y + 16}" width="16" height="16" rx="4" fill="${good ? C.passMid : '#b9bfc8'}"/>`;
      out += text(x + 40, y + 30, l, { size: 13, weight: 600 });
    });
    return out;
  };
  body += mark(38, 40, 'fail') + text(62, 47, 'Every tab says the same thing', { size: 19, weight: 700, fill: C.fail });
  body += tabs(66, ['Home', 'Home', 'Home'], false);
  body += mark(38, 170, 'pass') + text(62, 177, 'Each title names the page first, then the site', { size: 19, weight: 700, fill: C.pass });
  body += tabs(196, ['Cart (2 items) | Trailhead', 'Checkout: step 2 of 3 | Tr…', 'Tents | Trailhead'], true);
  body += text(400, 300, 'Titles are the first thing a screen reader announces, and they label tabs, bookmarks and search results.', { size: 14, fill: C.muted, anchor: 'middle' });
  add(s, 'browser-tabs', 320, body);

  body = text(24, 40, 'A simple pattern for page titles', { size: 20, weight: 800 });
  const parts = [['What is on this page', 'Checkout: step 2 of 3', '#dfeddb', C.passMid], ['|', '', '#fff', '#fff'], ['Site name', 'Trailhead Outfitters', C.soft, '#b9bfc8']];
  let x = 24;
  for (const [h, ex, fill, stroke] of parts) {
    if (h === '|') { body += text(x + 14, 114, '|', { size: 28, weight: 800, fill: C.muted }); x += 40; continue; }
    const w = 330;
    body += box(x, 72, w, 70, { fill, stroke, r: 12 }) + text(x + 16, 98, h, { size: 13, weight: 700, fill: C.muted }) + text(x + 16, 126, ex, { size: 17, weight: 800 });
    x += w + 10;
  }
  body += code(24, 168, 752, [['<title>Checkout: step 2 of 3 | Trailhead Outfitters</title>', '#b9e3b3']]);
  add(s, 'title-pattern', 230, body);
}

// ---------- 2.4.4 Link Purpose (In Context) ----------
{
  const s = '2-4-4-link-purpose-in-context';
  let { body, a, b } = compare(W, 400, 'A screen reader link list', 'Links that make sense alone');
  const listBox = (p, items, good) => {
    let out = box(p.x + 24, p.y + 70, p.w - 48, 230, { fill: '#fff', stroke: C.line, r: 10 }) + text(p.x + 40, p.y + 98, 'Links on this page', { size: 13, weight: 800, fill: C.muted });
    items.forEach((l, i) => {
      out += box(p.x + 40, p.y + 112 + i * 36, p.w - 80, 28, { fill: i === 1 ? (good ? '#dfeddb' : '#f8dcd9') : C.soft, stroke: 'none', r: 6 }) + text(p.x + 52, p.y + 131 + i * 36, l, { size: 14, weight: 600 });
    });
    return out;
  };
  body += listBox(a, ['Click here', 'Read more', 'Read more', 'Read more', 'More'], false);
  body += listBox(b, ['2026 price list (PDF)', 'Read more about tent sizes', 'Read more about waterproofing', 'Read more about returns', 'All camping guides'], true);
  body += caption(a.x + a.w / 2, a.y + 334, 'Out of context, every link sounds the same', 'fail');
  body += caption(b.x + b.w / 2, b.y + 334, 'Each link says where it goes', 'pass');
  add(s, 'link-list', 400, body);

  let t = compare(W, 380, 'The context is far away', 'Text and link belong together');
  body = t.body;
  for (const [p, good] of [[t.a, false], [t.b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += box(x, p.y + 70, w, 210, { fill: '#fff', stroke: C.line, r: 12 });
    body += `<rect x="${x + 16}" y="${p.y + 86}" width="${w - 32}" height="70" rx="8" fill="${C.soft}"/>`;
    body += text(x + 16, p.y + 184, 'Choosing a 2-person tent', { size: 16, weight: 800 });
    body += lines(x + 16, p.y + 198, w - 32, 2);
    body += text(x + 16, p.y + 262, good ? 'Read the 2-person tent guide' : 'Learn more', { size: 14, weight: 700, fill: C.info });
    body += `<path d="M${x + 16} ${p.y + 266}H${x + 16 + (good ? 200 : 82)}" stroke="${C.info}" stroke-width="1.5"/>`;
    body += caption(p.x + p.w / 2, p.y + 316, good ? 'The link text names the guide' : '"Learn more" only makes sense if you saw the heading', good ? 'pass' : 'fail');
  }
  add(s, 'card-link', 380, body);
}
