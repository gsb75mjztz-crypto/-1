(() => {
  'use strict';

  const STORAGE_KEY = 'routes.finance.progress.v1';

  const ICONS = {
    compass: '<path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" stroke-width="2"/><path d="M15 9l-2 6-6 2 2-6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    trend: '<path d="M4 17l5-5 4 4 7-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h5v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    umbrella: '<path d="M3 12a9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 12V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 12v7a2 2 0 01-4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    seed: '<path d="M12 22V12M12 12C7 12 4 8 4 4c5 0 8 3 8 8zM12 12c5 0 8-4 8-8-5 0-8 3-8 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" stroke-width="2"/>'
  };

  const ROUTES = [
    {
      id: 'track-budget',
      icon: 'compass',
      title: 'Track & Budget',
      tagline: 'Know exactly where your money goes',
      summary: 'You can\'t direct money you can\'t see. This route builds a clear, honest picture of your income and spending — the foundation every other route depends on.',
      steps: [
        'List every source of income for a typical month',
        'Pull the last 3 months of spending and sort it into categories',
        'Pick a budgeting method that fits your life (50/30/20, zero-based, or envelope)',
        'Set up a simple way to track spending going forward (app or spreadsheet)'
      ]
    },
    {
      id: 'emergency-fund',
      icon: 'umbrella',
      title: 'Build Your Emergency Fund',
      tagline: 'A cushion against life\'s surprises',
      summary: 'Without savings, the next flat tire or medical bill becomes new debt. A starter emergency fund breaks that cycle before you do anything else.',
      steps: [
        'Set a starter goal of one month of essential expenses',
        'Open a separate, easy-to-access savings account',
        'Automate a recurring transfer, even if it\'s small',
        'Grow the fund to 3–6 months of essential expenses over time'
      ]
    },
    {
      id: 'crush-debt',
      icon: 'shield',
      title: 'Pay Down High-Interest Debt',
      tagline: 'Stop interest from working against you',
      summary: 'High-interest debt is a guaranteed cost every month it exists. Clearing it (after capturing any employer retirement match) frees up cash for every route ahead.',
      steps: [
        'List every debt with its balance, interest rate, and minimum payment',
        'Choose a strategy: avalanche (highest rate first) or snowball (smallest balance first)',
        'Automate minimum payments on everything so nothing is missed',
        'Redirect all extra cash toward the one target debt until it\'s gone'
      ]
    },
    {
      id: 'retirement',
      icon: 'lock',
      title: 'Save for Retirement',
      tagline: 'Pay your future self first',
      summary: 'Time in the market is the biggest lever you have. Starting early — even small — lets compounding do most of the work for you.',
      steps: [
        'Capture any employer retirement match in full — it\'s free money',
        'Open a tax-advantaged retirement account if you don\'t have one',
        'Automate contributions, and increase them by 1% each year',
        'Choose low-cost, diversified funds instead of picking individual stocks'
      ]
    },
    {
      id: 'invest-grow',
      icon: 'trend',
      title: 'Invest & Grow Wealth',
      tagline: 'Put your surplus to work',
      summary: 'Beyond retirement accounts, disciplined investing grows wealth for other goals. The aim is consistency and low cost, not predicting the market.',
      steps: [
        'Define your time horizon and comfort with risk for this money',
        'Diversify across asset classes rather than concentrating in one bet',
        'Keep investing costs low — fees compound against you too',
        'Rebalance once or twice a year and ignore day-to-day noise'
      ]
    },
    {
      id: 'protect',
      icon: 'seed',
      title: 'Protect What You\'ve Built',
      tagline: 'Make sure one event can\'t undo it all',
      summary: 'A strong financial plan is only as good as its weakest point. This route covers the safety nets that protect everything else you\'ve built.',
      steps: [
        'Review insurance coverage — health, disability, life, and property',
        'Write or update a will and confirm beneficiaries on every account',
        'Revisit your whole plan once a year or after any big life change',
        'Understand the tax implications of your accounts and plan ahead'
      ]
    }
  ];

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable — progress just won't persist */
    }
  }

  let progress = loadProgress();

  function stepKey(routeId, index) {
    return `${routeId}:${index}`;
  }

  function routeCompletion(route) {
    const total = route.steps.length;
    const done = route.steps.reduce((n, _, i) => n + (progress[stepKey(route.id, i)] ? 1 : 0), 0);
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function overallCompletion() {
    const total = ROUTES.reduce((n, r) => n + r.steps.length, 0);
    const done = ROUTES.reduce((n, r) => n + routeCompletion(r).done, 0);
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function statusLabel(pct) {
    if (pct === 0) return 'Not started';
    if (pct === 100) return 'Complete';
    return 'In progress';
  }

  function renderRoadmap() {
    const list = document.getElementById('roadmap-list');
    list.innerHTML = ROUTES.map((route, i) => {
      const { pct } = routeCompletion(route);
      const stateClass = pct === 100 ? 'is-complete' : pct > 0 ? 'is-active' : '';
      return `
        <li class="roadmap-stop ${stateClass}">
          <a href="#${route.id}" class="roadmap-stop-link">
            <span class="roadmap-index">${pct === 100
              ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              : i + 1}</span>
            <span class="roadmap-stop-title">${route.title}</span>
          </a>
        </li>`;
    }).join('');
  }

  function renderRoutes() {
    const container = document.getElementById('routes-list');
    container.innerHTML = ROUTES.map((route, i) => {
      const { done, total, pct } = routeCompletion(route);
      return `
      <article class="route-card" id="${route.id}">
        <div class="route-card-header">
          <div class="route-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">${ICONS[route.icon]}</svg></div>
          <div class="route-heading">
            <p class="route-eyebrow">Route ${i + 1} of ${ROUTES.length}</p>
            <h3>${route.title}</h3>
            <p class="route-tagline">${route.tagline}</p>
          </div>
          <div class="route-status" data-status="${pct === 100 ? 'complete' : pct > 0 ? 'active' : 'idle'}">
            ${statusLabel(pct)}
          </div>
        </div>
        <p class="route-summary">${route.summary}</p>
        <div class="route-progress-track" aria-hidden="true">
          <div class="route-progress-fill" style="width:${pct}%"></div>
        </div>
        <p class="route-progress-label">${done} of ${total} steps complete</p>
        <ul class="step-list">
          ${route.steps.map((step, si) => {
            const key = stepKey(route.id, si);
            const checked = !!progress[key];
            const inputId = `step-${key}`;
            return `
            <li class="step-item">
              <input type="checkbox" id="${inputId}" data-route="${route.id}" data-index="${si}" ${checked ? 'checked' : ''}>
              <label for="${inputId}">${step}</label>
            </li>`;
          }).join('')}
        </ul>
      </article>`;
    }).join('');
  }

  function updateProgressChip() {
    const { pct } = overallCompletion();
    document.getElementById('progress-label').textContent = `${pct}% complete`;
    document.getElementById('header-bar-fill').style.width = `${pct}%`;
  }

  function renderAll() {
    renderRoadmap();
    renderRoutes();
    updateProgressChip();
  }

  document.addEventListener('change', (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox' && target.dataset.route) {
      const key = stepKey(target.dataset.route, Number(target.dataset.index));
      progress[key] = target.checked;
      saveProgress(progress);
      renderAll();
    }
  });

  renderAll();
})();
