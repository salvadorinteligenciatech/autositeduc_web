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
