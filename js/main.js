/* Acordes para o Futuro · comportamento da página (sem dependências). */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  /* ---------- Menu mobile ---------- */

  function setupMenu() {
    const toggle = $('[data-nav-toggle]');
    const nav = $('#menu');
    if (!toggle || !nav) return;

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (isOpen() && !event.target.closest('[data-header]')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Seção atual destacada no menu ---------- */

  function setupActiveSection() {
    const links = $$('#menu a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const byId = new Map(links.map((link) => [link.hash.slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.removeAttribute('aria-current'));
        byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Aviso rápido (toast) ---------- */

  const toast = $('[data-toast]');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  /* ---------- Copiar (chave Pix, copia e cola, link) ---------- */

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* cai no método antigo abaixo */
      }
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    area.remove();
    return copied;
  }

  function pageUrl() {
    return window.location.href.split('#')[0];
  }

  function setupCopyButtons() {
    $$('[data-copy]').forEach((button) => {
      const label = $('[data-label]', button);
      const originalLabel = label ? label.textContent : '';
      let resetTimer;

      button.addEventListener('click', async () => {
        const value = button.dataset.copy === 'url' ? pageUrl() : button.dataset.copy;
        const copied = await copyText(value);

        if (!copied) {
          showToast('Não foi possível copiar. Selecione o texto e copie manualmente.');
          return;
        }
        showToast(button.dataset.copyMsg || 'Copiado!');
        button.classList.add('is-copied');
        if (label) label.textContent = 'Copiado!';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          button.classList.remove('is-copied');
          if (label) label.textContent = originalLabel;
        }, 2200);
      });
    });
  }

  /* ---------- Compartilhar ---------- */

  function setupShare() {
    const text = 'Acordes para o Futuro: ação de Dia das Crianças no CCInter Vila Nilo (São Paulo). Veja como ajudar:';

    $$('[data-share]').forEach((button) => {
      button.addEventListener('click', async () => {
        const url = pageUrl();
        if (navigator.share) {
          try {
            await navigator.share({ title: document.title, text, url });
          } catch {
            /* usuário cancelou o compartilhamento */
          }
          return;
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener');
      });
    });
  }

  /* ---------- Contagem regressiva até a entrega ---------- */

  function setupCountdown() {
    const badge = $('[data-countdown]');
    if (!badge) return;

    const [year, month, day] = badge.dataset.countdown.split('-').map(Number);
    const eventDay = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Math.round((eventDay - today) / 86400000);
    if (days < 0) return;

    if (days === 0) badge.textContent = 'É hoje!';
    else if (days === 1) badge.textContent = 'Falta 1 dia';
    else badge.textContent = `Faltam ${days} dias`;
    badge.hidden = false;
  }

  /* ---------- Barra de arrecadação (opcional) ---------- */

  function parseAmount(raw) {
    let value = (raw || '').trim().replace(/^R\$\s*/, '');
    if (!value) return NaN;
    if (value.includes(',')) value = value.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(value)) value = value.replace(/\./g, '');
    return Number(value);
  }

  function setupProgress() {
    const box = $('[data-progress]');
    if (!box) return;

    const goal = parseAmount(box.dataset.meta);
    const raised = parseAmount(box.dataset.arrecadado);
    if (!Number.isFinite(goal) || goal <= 0 || !Number.isFinite(raised) || raised < 0) return;

    const percent = Math.min(100, (raised / goal) * 100);
    const track = $('.progress-track', box);
    const note = $('[data-progress-note]', box);

    $('[data-progress-value]', box).textContent = brl.format(raised);
    $('[data-progress-percent]', box).textContent = `${Math.floor(percent)}% da meta`;
    track.setAttribute('aria-valuenow', String(Math.round(percent)));
    track.setAttribute('aria-valuetext', `${brl.format(raised)} de ${brl.format(goal)}`);
    if (note && box.dataset.atualizado) note.textContent = `Atualizado em ${box.dataset.atualizado}.`;

    box.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => box.style.setProperty('--pct', `${percent}%`));
    });
  }

  /* ---------- Galeria ampliada ---------- */

  function setupLightbox() {
    const dialog = $('[data-lightbox-dialog]');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const caption = $('[data-lightbox-caption]', dialog);
    const image = document.createElement('img');
    image.decoding = 'async';
    const prev = $('[data-lightbox-prev]', dialog);
    const next = $('[data-lightbox-next]', dialog);
    let group = [];
    let index = 0;
    let opener = null;

    const show = (position) => {
      index = (position + group.length) % group.length;
      const link = group[index];
      const thumb = $('img', link);
      image.src = link.getAttribute('href');
      image.alt = thumb ? thumb.alt : '';
      if (!image.isConnected) caption.before(image);
      caption.textContent = link.dataset.caption || '';
      prev.hidden = next.hidden = group.length < 2;
    };

    $$('[data-lightbox]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        group = $$(`[data-lightbox="${link.dataset.lightbox}"]`);
        opener = link;
        show(group.indexOf(link));
        dialog.showModal();
      });
    });

    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    $('[data-lightbox-close]', dialog).addEventListener('click', () => dialog.close());

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', (event) => {
      if (group.length < 2) return;
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
    });
    dialog.addEventListener('close', () => {
      opener?.focus();
    });
  }

  setupMenu();
  setupActiveSection();
  setupCopyButtons();
  setupShare();
  setupCountdown();
  setupProgress();
  setupLightbox();
})();
