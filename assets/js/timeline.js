(() => {
  const parseIso = (s) => {
    if (!s || /present/i.test(s)) {
      const now = new Date();
      return now.getFullYear() + now.getMonth() / 12;
    }
    const m = String(s).trim().match(/^(\d{4})(?:-(\d{2}))?$/);
    if (!m) return 0;
    const year = parseInt(m[1], 10);
    const month = m[2] ? parseInt(m[2], 10) : 1;
    return year + (month - 1) / 12;
  };

  const layoutOne = (root) => {
    const stage = root.querySelector('.tl-stage');
    const topRow = root.querySelector('.tl-row-top');
    const bottomRow = root.querySelector('.tl-row-bottom');
    const yearsEl = root.querySelector('.tl-years');
    const barsEl = root.querySelector('.tl-bars');
    const svgEl = root.querySelector('.tl-connectors');
    const store = root.querySelector('.tl-data');
    if (!stage || !topRow || !bottomRow || !yearsEl || !barsEl || !svgEl || !store) return;

    const entries = [...store.querySelectorAll('.tl-entry')].map((el, index) => {
      const start = parseIso(el.dataset.start);
      const end = parseIso(el.dataset.end);
      const color = el.dataset.color || '#7c3aed';
      return { el, start, end: Math.max(end, start + 1 / 12), color, index };
    });
    if (!entries.length) return;

    const padding = 24;
    const cardW = 232;
    const minGap = cardW + 16;
    const globalMin = Math.floor(Math.min(...entries.map((e) => e.start)));
    const globalMax = Math.ceil(Math.max(...entries.map((e) => e.end)));
    const span = globalMax - globalMin || 1;
    const width = root.clientWidth;
    const usable = Math.max(width - padding * 2, 100);

    const toPx = (t) => padding + ((t - globalMin) / span) * usable;

    const positions = entries.map((entry) => {
      const startPx = toPx(entry.start);
      const endPx = toPx(entry.end);
      const midPx = (startPx + endPx) / 2;
      return {
        entry,
        isAbove: entry.index % 2 === 0,
        startPx,
        endPx,
        midPx,
        centerPx: midPx,
      };
    });

    for (const above of [true, false]) {
      const row = positions.filter((p) => p.isAbove === above).sort((a, b) => a.centerPx - b.centerPx);
      for (let j = 1; j < row.length; j++) {
        if (row[j].centerPx - row[j - 1].centerPx < minGap) {
          row[j].centerPx = row[j - 1].centerPx + minGap;
        }
      }
    }

    positions.forEach((p) => {
      p.centerPx = Math.max(padding + cardW / 2, Math.min(width - padding - cardW / 2, p.centerPx));
    });

    topRow.innerHTML = '';
    bottomRow.innerHTML = '';
    yearsEl.innerHTML = '';
    barsEl.innerHTML = '';

    for (let y = globalMin; y <= globalMax; y++) {
      const tick = document.createElement('span');
      tick.className = 'tl-year';
      tick.textContent = String(y);
      tick.style.left = `${toPx(y)}px`;
      yearsEl.appendChild(tick);
    }

    const placed = [];

    positions.forEach((p) => {
      const bar = document.createElement('div');
      bar.className = 'tl-bar';
      bar.style.left = `${p.startPx}px`;
      bar.style.width = `${Math.max(p.endPx - p.startPx, 6)}px`;
      bar.style.background = p.entry.color;
      barsEl.appendChild(bar);

      const wrap = document.createElement('div');
      wrap.className = 'tl-item';
      wrap.style.left = `${p.centerPx}px`;
      const card = p.entry.el.querySelector('.tl-card');
      if (card) {
        const clone = card.cloneNode(true);
        clone.style.borderTopColor = p.entry.color;
        const logo = clone.querySelector('.tl-logo');
        if (logo) logo.style.borderColor = p.entry.color;
        wrap.appendChild(clone);
      }

      const row = p.isAbove ? topRow : bottomRow;
      row.appendChild(wrap);
      placed.push({ wrap, ...p });
    });

    const axisRow = root.querySelector('.tl-axis-row');
    if (!axisRow) return;

    const drawLinks = () => {
      const axisY = axisRow.offsetTop + axisRow.offsetHeight / 2;
      svgEl.setAttribute('width', String(width));
      svgEl.setAttribute('height', String(stage.offsetHeight));
      svgEl.innerHTML = '';
      placed.forEach((p) => {
        const cardX = p.centerPx;
        const cardY = p.isAbove
          ? p.wrap.offsetTop + p.wrap.offsetHeight
          : p.wrap.offsetTop;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(cardX));
        line.setAttribute('y1', String(cardY));
        line.setAttribute('x2', String(p.midPx));
        line.setAttribute('y2', String(axisY));
        line.setAttribute('stroke', p.entry.color);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-opacity', '0.5');
        line.setAttribute('stroke-dasharray', '4 3');
        svgEl.appendChild(line);
      });
    };

    drawLinks();
    requestAnimationFrame(drawLinks);
  };

  const layoutAll = () => {
    document.querySelectorAll('.bg-panel:not([hidden]) .tl').forEach(layoutOne);
  };

  const run = () => {
    layoutAll();
    document.addEventListener('bg-panel-change', layoutAll);
    window.addEventListener('resize', () => {
      clearTimeout(run._t);
      run._t = setTimeout(layoutAll, 120);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
