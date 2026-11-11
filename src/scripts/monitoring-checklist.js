/** Persists a checklist in this browser only. Nothing is uploaded. */
function readSaved(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function initMonitoringChecklist(root = document.querySelector('[data-monitor-checklist]')) {
  if (!root) return;
  const key = root.getAttribute('data-storage-key') || 'accessbell-monitoring-checklist-v1';
  const boxes = [...root.querySelectorAll('input[type="checkbox"]')];
  const status = root.querySelector('[data-checklist-status]');
  const saved = readSaved(key);

  const render = () => {
    const checked = boxes.filter((box) => box.checked).length;
    if (status) status.textContent = `${checked} of ${boxes.length} checked on this browser. Nothing is sent to AccessBell.`;
  };

  const persist = () => {
    const next = {};
    for (const box of boxes) if (box.checked) next[box.id] = true;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Private browsing can block storage. The ticks still work for this visit. */
    }
    render();
  };

  for (const box of boxes) {
    box.checked = saved[box.id] === true;
    box.addEventListener('change', persist);
  }

  root.querySelector('[data-checklist-reset]')?.addEventListener('click', () => {
    for (const box of boxes) box.checked = false;
    try {
      localStorage.removeItem(key);
    } catch {
      /* The boxes are already clear. */
    }
    render();
    boxes[0]?.focus();
  });

  render();
}

if (typeof document !== 'undefined') initMonitoringChecklist();
