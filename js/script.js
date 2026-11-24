(() => {
  'use strict';
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  const config = window.WORKFAST_CONFIG || {};
  const configuredNumber = String(config.whatsappNumber || '').replace(/\D/g, '');
  const year = qs('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const header = qs('.site-header');
  let scrollQueued = false;
  function syncHeader() {
    header?.classList.toggle('is-scrolled', window.scrollY > 28);
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(syncHeader); }
  }, { passive: true });
  syncHeader();

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -38px 0px', threshold: .1 });
    qsa('.reveal').forEach(el => reveal.observe(el));
  } else qsa('.reveal').forEach(el => el.classList.add('visible'));

  const phone = qs('#leadPhone');
  phone?.addEventListener('input', () => {
    const nums = phone.value.replace(/\D/g, '').slice(0, 11);
    if (!nums) { phone.value = ''; return; }
    let out = '(' + nums.slice(0, 2);
    if (nums.length >= 2) out += ') ';
    if (nums.length > 2) out += nums.slice(2, nums.length > 10 ? 7 : 6);
    if (nums.length > (nums.length > 10 ? 7 : 6)) out += '-' + nums.slice(nums.length > 10 ? 7 : 6);
    phone.value = out;
  });

  qsa('[data-service]').forEach(link => link.addEventListener('click', () => {
    const selected = link.getAttribute('data-service');
    const serviceSelect = qs('#leadService');
    if (serviceSelect && selected && [...serviceSelect.options].some(opt => opt.value === selected)) serviceSelect.value = selected;
  }));

  const floatingContact = qs('.float-contact');
  floatingContact?.addEventListener('click', () => {
    const url = 'https://wa.me/' + configuredNumber + '?text=' + encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços da WORK FAST.');
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  const toast = qs('#toast');
  let toastTimeout;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 5500);
  }
  qs('#leadForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const name = String(qs('#leadName').value || '').trim();
    const contact = String(qs('#leadPhone').value || '').trim();
    const service = String(qs('#leadService').value || '').trim();
    const details = String(qs('#leadMessage').value || '').trim();
    const lines = [
      'Olá, equipe WORK FAST! Quero solicitar um orçamento.',
      '',
      'Nome: ' + name,
      'WhatsApp: ' + contact,
      'Serviço: ' + service,
    ];
    if (details) lines.push('Sobre meu negócio: ' + details);
    const msg = lines.join('\n');
    const feedback = qs('#formFeedback');
    if (!configuredNumber) {
      try {
        await navigator.clipboard.writeText(msg);
        const note = 'Prévia do site: mensagem copiada! Para ativar o envio direto, informe o WhatsApp comercial em js/config.js.';
        if (feedback) feedback.textContent = note;
        notify('Mensagem copiada. Falta configurar o número comercial para enviar diretamente.');
      } catch (_) {
        const note = 'Prévia do site: falta configurar o número comercial em js/config.js para habilitar o envio pelo WhatsApp.';
        if (feedback) feedback.textContent = note;
        notify(note);
      }
      return;
    }
    const url = 'https://wa.me/' + configuredNumber + '?text=' + encodeURIComponent(msg);
    if (feedback) feedback.textContent = 'O WhatsApp será aberto com a sua mensagem preenchida. É só tocar em enviar.';
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  qsa('.faq-items details').forEach(item => item.addEventListener('toggle', () => {
    if (item.open) qsa('.faq-items details').forEach(other => { if (other !== item) other.open = false; });
  }));

  const video = qs('.hero-video');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches && video) { video.pause(); video.removeAttribute('autoplay'); }
})();
