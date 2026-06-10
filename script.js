'use strict';

const STORAGE_KEY = 'decodelabs-saved-cards';

const state = {
  menuOpen: false,
  savedCards: new Set(),
};

function loadSavedCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    JSON.parse(raw).forEach((id) => state.savedCards.add(String(id)));
  } catch {
    state.savedCards.clear();
  }
}

function persistSavedCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.savedCards]));
}

function updateSavedCount() {
  const countEl = document.getElementById('saved-count');
  if (!countEl) return;

  const count = state.savedCards.size;
  countEl.textContent = `${count} item${count === 1 ? '' : 's'} saved`;
}

function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  const links = document.querySelectorAll('.nav-link, .bottom-link');

  if (!toggle || !nav) return;

  const setMenuOpen = (open) => {
    state.menuOpen = open;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => setMenuOpen(!state.menuOpen));

  links.forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.menuOpen) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && state.menuOpen) {
      setMenuOpen(false);
    }
  });
}

function initBookmarks() {
  const buttons = document.querySelectorAll('.bookmark-btn');

  buttons.forEach((button) => {
    const card = button.closest('.card');
    const id = card?.dataset.id;
    if (!id) return;

    const isSaved = state.savedCards.has(id);
    button.setAttribute('aria-pressed', String(isSaved));
    if (isSaved) card.classList.add('is-saved');

    button.addEventListener('click', () => {
      const saved = state.savedCards.has(id);

      if (saved) {
        state.savedCards.delete(id);
        button.setAttribute('aria-pressed', 'false');
        card.classList.remove('is-saved');
      } else {
        state.savedCards.add(id);
        button.setAttribute('aria-pressed', 'true');
        card.classList.add('is-saved');
      }

      persistSavedCards();
      updateSavedCount();
    });
  });

  updateSavedCount();
}

function initScrollSpy() {
  const sections = ['hero', 'content', 'about'];
  const navLinks = document.querySelectorAll('.nav-link, .bottom-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          link.classList.toggle('is-active', href === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadSavedCards();
  initNavigation();
  initBookmarks();
  initScrollSpy();
});
