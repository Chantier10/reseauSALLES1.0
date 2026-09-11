const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#main-nav');

if (toggle && nav) {
  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('is-open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      toggle.focus();
    }
  });
}

// Keep the static HTML usable when JavaScript or animations are unavailable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const principles = Array.from(document.querySelectorAll('.principles > span'));
const descriptions = Array.from(document.querySelectorAll('.mission__text > span'));
const pauseButton = document.querySelector('.principles__pause');
let activePrinciple = 0;
let cycleTimer;
let paused = false;

function showPrinciple(index) {
  activePrinciple = index;
  principles.forEach((element, i) => element.classList.toggle('principles__active', i === index));
  descriptions.forEach((element, i) => {
    element.classList.toggle('is-active', i === index);
    element.setAttribute('aria-hidden', String(i !== index));
  });
}

function updateCycle() {
  clearInterval(cycleTimer);
  if (!principles.length || principles.length !== descriptions.length) return;
  if (pauseButton) pauseButton.hidden = reducedMotion.matches;
  if (reducedMotion.matches) {
    showPrinciple(principles.length - 1);
  } else if (!paused && !document.hidden) {
    cycleTimer = setInterval(() => showPrinciple((activePrinciple + 1) % principles.length), 4000);
  }
}

if (pauseButton) {
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Reprendre l’animation' : 'Mettre l’animation en pause';
    updateCycle();
  });
}
document.addEventListener('visibilitychange', updateCycle);
updateCycle();

const counters = Array.from(document.querySelectorAll('[data-count]'));
const impactGrid = document.querySelector('.impact__grid');
let counterFrame;
let counterObserver;
let countersStarted = false;

function finishCounters() {
  cancelAnimationFrame(counterFrame);
  counters.forEach(element => { element.textContent = element.dataset.count; });
  counterObserver?.disconnect();
  countersStarted = true;
}

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  counterObserver.disconnect();
  const start = performance.now();
  const duration = 1600;
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counters.forEach(element => {
      element.textContent = String(Math.round(Number(element.dataset.count) * eased));
    });
    if (progress < 1) counterFrame = requestAnimationFrame(tick);
  }
  counterFrame = requestAnimationFrame(tick);
}

if (impactGrid && counters.length && !reducedMotion.matches && 'IntersectionObserver' in window) {
  counters.forEach(element => { element.textContent = '0'; });
  counterObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) startCounters();
  }, { threshold: 0.15 });
  counterObserver.observe(impactGrid);
} else {
  finishCounters();
}

reducedMotion.addEventListener('change', () => {
  updateCycle();
  if (reducedMotion.matches) finishCounters();
});
