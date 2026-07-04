const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const year = document.querySelector('[data-year]');

if (year) year.textContent = new Date().getFullYear();

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

navToggle?.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const tutorialTrack = document.querySelector('[data-tutorial-track]');
const tutorialPrev = document.querySelector('[data-tutorial-prev]');
const tutorialNext = document.querySelector('[data-tutorial-next]');

function scrollTutorials(direction) {
  if (!tutorialTrack) return;
  const distance = tutorialTrack.clientWidth * 0.88;
  tutorialTrack.scrollBy({
    left: direction * distance,
    behavior: 'smooth',
  });
}

tutorialPrev?.addEventListener('click', () => scrollTutorials(-1));
tutorialNext?.addEventListener('click', () => scrollTutorials(1));

function getBahiaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bahia',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function shouldBlockTallyForm(date = new Date()) {
  const bahiaDate = getBahiaDateParts(date);
  const hour = Number(bahiaDate.hour);
  const minute = Number(bahiaDate.minute);
  const minutesSinceMidnight = hour * 60 + minute;
  const blockStartFriday = 17 * 60 + 30;
  const blockEndSaturday = 17 * 60 + 30;

  return (
    (bahiaDate.weekday === 'Friday' && minutesSinceMidnight >= blockStartFriday) ||
    (bahiaDate.weekday === 'Saturday' && minutesSinceMidnight < blockEndSaturday)
  );
}

const saturdayBlockMessage = 'Hoje é sábado! Para adquirir uma assinatura do sistema AutoSITEduc, por gentileza, retorne ao nosso site após o pôr do sol.';

function showSaturdayBlockDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'saturday-dialog-backdrop';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'saturday-dialog-title');

  dialog.innerHTML = `
    <div class="saturday-dialog">
      <strong id="saturday-dialog-title">Atenção</strong>
      <p>${saturdayBlockMessage}</p>
      <button type="button" class="saturday-dialog-button">Entendi</button>
    </div>
  `;

  document.body.appendChild(dialog);

  const closeButton = dialog.querySelector('.saturday-dialog-button');
  closeButton?.focus();

  function closeDialog() {
    dialog.remove();
    document.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') closeDialog();
  }

  closeButton?.addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  document.addEventListener('keydown', handleKeydown);
}

function blockTallyFormDuringRestrictedWindow() {
  const shouldBlock = shouldBlockTallyForm();
  if (!shouldBlock) return;

  document.querySelectorAll('.tally-embed').forEach((embed) => {
    const iframe = embed.querySelector('iframe');
    if (iframe) iframe.remove();

    embed.classList.add('tally-embed-blocked');
    embed.setAttribute('aria-label', 'Formulário indisponível aos sábados');

    embed.innerHTML = `
      <div class="saturday-form-block" role="alert" aria-live="polite">
        <strong>Atenção</strong>
        <p>${saturdayBlockMessage}</p>
      </div>
    `;
  });

  showSaturdayBlockDialog();
}

blockTallyFormDuringRestrictedWindow();
