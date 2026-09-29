// Free Accessibility Icon Set: recolor previews and downloads, copy SVG code.
// Without JavaScript the links still download the default-color files.
const PNG_SIZE = 512;

function init(root) {
  const defaultColor = root.dataset.defaultColor;
  const input = root.querySelector('[data-icon-color]');
  const reset = root.querySelector('[data-icon-reset]');
  const status = root.querySelector('[data-icon-status]');
  const cache = new Map();
  let color = defaultColor;

  const say = (msg) => {
    status.textContent = '';
    requestAnimationFrame(() => (status.textContent = msg));
  };

  async function svgText(slug) {
    if (!cache.has(slug)) {
      const res = await fetch(`/downloads/accessibility-icons/svg/${slug}.svg`);
      cache.set(slug, await res.text());
    }
    return cache.get(slug).replaceAll(defaultColor, color);
  }

  function save(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }

  async function pngBlob(svg) {
    // A data: URL, because the site's Content-Security-Policy allows data: images but not blob: ones.
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = PNG_SIZE;
    canvas.getContext('2d').drawImage(img, 0, 0, PNG_SIZE, PNG_SIZE);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  const setColor = (value) => {
    color = value.toLowerCase();
    root.style.setProperty('--ic-color', color);
  };
  input.addEventListener('input', () => setColor(input.value));
  input.addEventListener('change', () => say(`Icon color set to ${color}. Downloads and copied code use this color.`));
  reset.addEventListener('click', () => {
    input.value = defaultColor;
    setColor(defaultColor);
    say('Icon color reset to the default green.');
  });

  root.querySelectorAll('[data-icon-download]').forEach((link) =>
    link.addEventListener('click', async (e) => {
      if (color === defaultColor.toLowerCase()) return;
      e.preventDefault();
      const { slug, iconDownload: fmt } = link.dataset;
      try {
        const svg = await svgText(slug);
        save(fmt === 'png' ? await pngBlob(svg) : new Blob([svg], { type: 'image/svg+xml' }), `${slug}.${fmt}`);
        say(`Downloaded ${slug}.${fmt} in ${color}.`);
      } catch {
        location.href = link.href;
      }
    }),
  );

  root.querySelectorAll('[data-icon-copy]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const label = btn.querySelector('span');
      try {
        await navigator.clipboard.writeText(await svgText(btn.dataset.slug));
        label.textContent = 'Copied';
        say('SVG code copied to the clipboard.');
        setTimeout(() => (label.textContent = 'Copy SVG'), 2000);
      } catch {
        say('Copy is not available in this browser. Download the SVG file instead.');
      }
    }),
  );
}

document.querySelectorAll('[data-icon-set]').forEach(init);

const creditBtn = document.querySelector('[data-copy-credit]');
creditBtn?.addEventListener('click', async () => {
  const label = creditBtn.querySelector('span');
  try {
    await navigator.clipboard.writeText(document.querySelector('[data-credit-text]').textContent);
    label.textContent = 'Copied';
    setTimeout(() => (label.textContent = 'Copy credit'), 2000);
  } catch {}
});
