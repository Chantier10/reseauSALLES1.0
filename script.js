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

// Keep final values in HTML for visitors without JavaScript.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const principles = Array.from(document.querySelectorAll('.principles > button'));
const descriptions = Array.from(document.querySelectorAll('.mission__text > span'));
const automaticDelay = 3000;
const readingDelay = 7000;
let activePrinciple = 0;
let cycleTimer;
let readingUntil = 0;

function showPrinciple(index) {
  activePrinciple = index;
  principles.forEach((element, i) => {
    element.classList.toggle('principles__active', i === index);
    element.setAttribute('aria-pressed', String(i === index));
  });
  descriptions.forEach((element, i) => {
    element.classList.toggle('is-active', i === index);
    element.setAttribute('aria-hidden', String(i !== index));
  });
}

function scheduleCycle() {
  clearTimeout(cycleTimer);
  if (reducedMotion.matches || document.hidden || !principles.length) return;
  const delay = Math.max(automaticDelay, readingUntil - performance.now());
  cycleTimer = setTimeout(() => {
    showPrinciple((activePrinciple + 1) % principles.length);
    scheduleCycle();
  }, delay);
}

if (principles.length && principles.length === descriptions.length) {
  showPrinciple(reducedMotion.matches ? principles.length - 1 : 0);
  principles.forEach((element, index) => {
    element.addEventListener('click', () => {
      showPrinciple(index);
      readingUntil = performance.now() + readingDelay;
      scheduleCycle();
    });
  });
  document.addEventListener('visibilitychange', scheduleCycle);
  scheduleCycle();
}

const counters = Array.from(document.querySelectorAll('[data-count]'));
const impactGrid = document.querySelector('.impact__grid');
let counterFrame;
let countersInView = false;

function finishCounters() {
  cancelAnimationFrame(counterFrame);
  counters.forEach(element => { element.textContent = element.dataset.count; });
}

function startCounters() {
  cancelAnimationFrame(counterFrame);
  if (reducedMotion.matches) {
    finishCounters();
    return;
  }
  counters.forEach(element => { element.textContent = '0'; });
  const start = performance.now();
  function tick(now) {
    let running = false;
    counters.forEach(element => {
      const progress = Math.min((now - start) / Number(element.dataset.duration), 1);
      // Linear progression makes small values readable; large values skip steps.
      element.textContent = String(Math.floor(Number(element.dataset.count) * progress));
      if (progress < 1) running = true;
    });
    if (running) counterFrame = requestAnimationFrame(tick);
  }
  counterFrame = requestAnimationFrame(tick);
}

if (impactGrid && counters.length && 'IntersectionObserver' in window) {
  if (!reducedMotion.matches) counters.forEach(element => { element.textContent = '0'; });
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Only a complete exit rearms the animation, avoiding boundary flicker.
      if (!entry.isIntersecting) {
        countersInView = false;
        finishCounters();
      } else if (entry.intersectionRatio >= 0.15 && !countersInView) {
        countersInView = true;
        startCounters();
      }
    });
  }, { threshold: [0, 0.15] });
  counterObserver.observe(impactGrid);
} else {
  finishCounters();
}

reducedMotion.addEventListener('change', () => {
  scheduleCycle();
  if (reducedMotion.matches) finishCounters();
});
