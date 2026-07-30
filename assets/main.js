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

function initializeLaunchCountdown() {
  const countdown = document.querySelector('[data-launch-countdown]');
  if (!countdown) return;

  const deadlineValue = countdown.dataset.deadline;
  const deadline = new Date(deadlineValue);

  const daysElement = countdown.querySelector('[data-countdown-days]');
  const hoursElement = countdown.querySelector('[data-countdown-hours]');
  const minutesElement = countdown.querySelector('[data-countdown-minutes]');
  const secondsElement = countdown.querySelector('[data-countdown-seconds]');
  const statusElement = countdown.querySelector('[data-countdown-status]');
  const actionElement = countdown.querySelector('.launch-countdown-action');

  if (
    Number.isNaN(deadline.getTime()) ||
    !daysElement ||
    !hoursElement ||
    !minutesElement ||
    !secondsElement
  ) {
    console.error('Não foi possível inicializar a contagem regressiva.');
    countdown.hidden = true;
    return;
  }

  let intervalId;

  function formatUnit(value) {
    return String(value).padStart(2, '0');
  }

  function updateCountdown() {
    const now = new Date();

    if (shouldBlockTallyForm(now)) {
      countdown.hidden = true;
      return;
    }

    const remainingMilliseconds = deadline.getTime() - now.getTime();

    if (remainingMilliseconds <= 0) {
      countdown.hidden = true;

      if (intervalId) {
        window.clearInterval(intervalId);
      }

      return false;
    }

    const totalSeconds = Math.floor(remainingMilliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysElement.textContent = formatUnit(days);
    hoursElement.textContent = formatUnit(hours);
    minutesElement.textContent = formatUnit(minutes);
    secondsElement.textContent = formatUnit(seconds);

    if (statusElement) {
      statusElement.textContent =
        'A contagem considera o horário oficial de Salvador, Bahia.';
    }

    if (actionElement) {
      actionElement.hidden = false;
    }

    countdown.hidden = false;
    countdown.classList.add('is-visible');
  }

  const shouldContinue = updateCountdown();

  if (shouldContinue !== false) {
    intervalId = window.setInterval(updateCountdown, 1000);
  }
}

initializeLaunchCountdown();

function initializeScheduledPricing() {
  const pricingGrid = document.querySelector('[data-pricing-grid]');
  const restrictedMessage = document.querySelector('[data-pricing-restricted-message]');
  const pricingNote = document.querySelector('[data-pricing-note]');
  const pricingCards = document.querySelectorAll('[data-pricing-card]');

  if (!pricingGrid || !pricingCards.length) return;

  function updateScheduledPricing() {
    const now = new Date();
    const isRestricted = shouldBlockTallyForm(now);

    pricingGrid.hidden = isRestricted;

    if (pricingNote) {
      pricingNote.hidden = isRestricted;
    }

    if (restrictedMessage) {
      restrictedMessage.hidden = !isRestricted;
    }

    if (isRestricted) return;

    pricingCards.forEach((card) => {
      const priceChange = new Date(card.dataset.priceChange);

      if (Number.isNaN(priceChange.getTime())) {
        console.error('Data de alteração de preço inválida.', card);
        return;
      }

      const useNewPrice = now.getTime() >= priceChange.getTime();
      const valueKey = useNewPrice ? 'priceAfter' : 'priceBefore';

      card
        .querySelectorAll(
          '[data-price-badge], [data-current-price], [data-monthly-price]'
        )
        .forEach((element) => {
          const value = element.dataset[valueKey];

          if (value) {
            element.textContent = value;
          }
        });
    });
  }

  updateScheduledPricing();
  window.setInterval(updateScheduledPricing, 1000);
}

initializeScheduledPricing();

function initializeHelpCenter() {
  const searchInput = document.querySelector('[data-help-search]');
  const searchStatus = document.querySelector('[data-help-search-status]');
  const expandButton = document.querySelector('[data-help-expand]');
  const collapseButton = document.querySelector('[data-help-collapse]');
  const emptyMessage = document.querySelector('[data-help-empty]');
  const groups = Array.from(document.querySelectorAll('.help-group'));
  const items = Array.from(document.querySelectorAll('[data-help-item]'));

  if (!groups.length || !items.length) return;

  function normalizeText(value) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function updateSearch() {
    const query = normalizeText(searchInput?.value || '');
    let visibleItems = 0;

    items.forEach((item) => {
      const searchableText = normalizeText(
        `${item.textContent || ''} ${item.dataset.search || ''}`
      );

      const matches = !query || searchableText.includes(query);

      item.hidden = !matches;

      if (matches) {
        visibleItems += 1;

        if (query) {
          item.open = true;
        }
      }
    });

    groups.forEach((group) => {
      const visibleChildren = group.querySelectorAll(
        '[data-help-item]:not([hidden])'
      );

      group.hidden = visibleChildren.length === 0;

      if (query && visibleChildren.length > 0) {
        group.open = true;
      }
    });

    if (emptyMessage) {
      emptyMessage.hidden = visibleItems !== 0;
    }

    if (searchStatus) {
      if (!query) {
        searchStatus.textContent = '';
      } else if (visibleItems === 0) {
        searchStatus.textContent = 'Nenhuma orientação encontrada.';
      } else if (visibleItems === 1) {
        searchStatus.textContent = '1 orientação encontrada.';
      } else {
        searchStatus.textContent = `${visibleItems} orientações encontradas.`;
      }
    }
  }

  function setAllDetailsOpen(isOpen) {
    groups.forEach((group) => {
      if (!group.hidden) {
        group.open = isOpen;
      }
    });

    items.forEach((item) => {
      if (!item.hidden) {
        item.open = isOpen;
      }
    });
  }

  searchInput?.addEventListener('input', updateSearch);
  expandButton?.addEventListener('click', () => setAllDetailsOpen(true));
  collapseButton?.addEventListener('click', () => setAllDetailsOpen(false));

  const targetId = decodeURIComponent(window.location.hash.slice(1));
  const targetItem = targetId ? document.getElementById(targetId) : null;

  if (targetItem?.matches('[data-help-item]')) {
    const parentGroup = targetItem.closest('.help-group');

    if (parentGroup) {
      parentGroup.open = true;
    }

    targetItem.open = true;

    window.requestAnimationFrame(() => {
      targetItem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  updateSearch();
}

initializeHelpCenter();
