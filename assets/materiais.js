const materialCards = [...document.querySelectorAll('[data-material-card]')];
const materialFilters = [...document.querySelectorAll('[data-filter]')];
const materialSearch = document.querySelector('[data-material-search]');
const emptyState = document.querySelector('[data-empty-state]');

const materialModal = document.querySelector('[data-material-modal]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalContent = document.querySelector('[data-modal-content]');
const modalCloseElements = document.querySelectorAll('[data-modal-close]');

let activeFilter = 'todos';

function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function updateMaterials() {
  const searchValue = normalizeText(materialSearch?.value || '');
  let visibleCount = 0;

  materialCards.forEach((card) => {
    const subject = card.dataset.subject || '';
    const searchableText = normalizeText(card.dataset.search || '');

    const matchesFilter =
      activeFilter === 'todos' || subject === activeFilter;

    const matchesSearch =
      !searchValue || searchableText.includes(searchValue);

    const shouldShow = matchesFilter && matchesSearch;

    card.hidden = !shouldShow;

    if (shouldShow) {
      visibleCount += 1;
    }
  });

  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
  }
}

materialFilters.forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    activeFilter = filterButton.dataset.filter || 'todos';

    materialFilters.forEach((button) => {
      button.classList.toggle('is-active', button === filterButton);
    });

    updateMaterials();
  });
});

materialSearch?.addEventListener('input', updateMaterials);

document.querySelectorAll('[data-subject-link]').forEach((subjectLink) => {
  subjectLink.addEventListener('click', () => {
    const subject = subjectLink.dataset.subjectLink;
    const targetFilter = materialFilters.find(
      (button) => button.dataset.filter === subject
    );

    if (!targetFilter) return;

    activeFilter = subject;

    materialFilters.forEach((button) => {
      button.classList.toggle('is-active', button === targetFilter);
    });

    updateMaterials();
  });
});

function closeMaterialModal() {
  if (!materialModal) return;

  materialModal.hidden = true;
  document.body.style.overflow = '';

  if (modalContent) {
    modalContent.innerHTML = '';
  }
}

function openMaterialModal(button) {
  if (!materialModal || !modalTitle || !modalContent) return;

  const title = button.dataset.title || 'Amostra do material';
  const previewImages = (button.dataset.preview || '')
    .split(',')
    .map((path) => path.trim())
    .filter(Boolean);

  modalTitle.textContent = title;
  modalContent.innerHTML = '';

  previewImages.forEach((imagePath, index) => {
    const image = document.createElement('img');

    image.src = imagePath;
    image.alt = `Página ${index + 1} da amostra de ${title}`;
    image.loading = index === 0 ? 'eager' : 'lazy';

    modalContent.appendChild(image);
  });

  if (!previewImages.length) {
    const message = document.createElement('p');

    message.textContent =
      'A amostra deste material ainda não está disponível.';

    modalContent.appendChild(message);
  }

  materialModal.hidden = false;
  document.body.style.overflow = 'hidden';

  materialModal
    .querySelector('.material-modal-close')
    ?.focus();
}

document.querySelectorAll('[data-preview-button]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.disabled) return;
    openMaterialModal(button);
  });
});

modalCloseElements.forEach((element) => {
  element.addEventListener('click', closeMaterialModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && materialModal && !materialModal.hidden) {
    closeMaterialModal();
  }
});

updateMaterials();


function initializeMaterialsVisibility() {
  const toggle = document.querySelector(
    '[data-materials-visibility-toggle]'
  );
  const catalog = document.querySelector(
    '[data-materials-grid]'
  );
  const label = document.querySelector(
    '[data-materials-visibility-label]'
  );

  if (!toggle || !catalog) return;

  function setCatalogVisibility(isOpen) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    catalog.setAttribute('aria-hidden', String(!isOpen));
    catalog.classList.toggle('is-open', isOpen);

    if (label) {
      label.textContent = isOpen
        ? 'Ocultar materiais'
        : 'Mostrar materiais';
    }
  }

  // Estado inicial solicitado: olho fechado e cards ocultos.
  setCatalogVisibility(false);

  toggle.addEventListener('click', () => {
    const isOpen =
      toggle.getAttribute('aria-expanded') === 'true';

    setCatalogVisibility(!isOpen);
  });

  document.querySelectorAll('[data-subject-link]').forEach((link) => {
    link.addEventListener('click', () => {
      setCatalogVisibility(true);
    });
  });
}

initializeMaterialsVisibility();
