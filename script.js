const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
function closeMenu() {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
}
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.navbar')) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
document.querySelectorAll('.service-detail').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    detail.closest('.service-details').querySelectorAll('details').forEach(sibling => {
      if (sibling !== detail) sibling.open = false;
    });
  });
});
const topicInput = document.getElementById('topic');
const selectedService = document.getElementById('selected-service');
document.querySelectorAll('[data-topic]').forEach(link => {
  link.addEventListener('click', () => {
    topicInput.value = link.dataset.topic;
    selectedService.textContent = `Especialidad seleccionada: ${link.dataset.topic}. Puedes cambiarla en el formulario.`;
    selectedService.hidden = false;
  });
});
topicInput.addEventListener('change', () => { selectedService.hidden = true; });
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('contact-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const topic = topicInput.value;
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !message) return;
  const subject = `Consulta web — ${topic}`;
  const body = `Hola, equipo de Parada & Gamarra:\n\nMi nombre es ${name}.\nCorreo de contacto: ${email}\nÁrea de consulta: ${topic}\n\nMi consulta:\n${message}\n\nQuedo atento(a) a su respuesta.`;
  window.location.href = `mailto:administracion@paradagamarra.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.getElementById('form-note').textContent = 'Se ha solicitado abrir tu aplicación de correo. Verifica el mensaje y pulsa Enviar allí.';
});

// Animate only the main ideas; the original wording and reading order stay intact.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const keyPhrases = document.querySelectorAll(
  '#hero-heading .accent, h2 .accent, .quote-band .accent'
);

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const phraseReplayTimers = new Set();
  keyPhrases.forEach(phrase => {
    const words = phrase.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();
    let wordIndex = 0;
    words.forEach(word => {
      if (!word.trim()) {
        fragment.append(document.createTextNode(word));
        return;
      }
      const span = document.createElement('span');
      span.className = 'motion-word';
      span.textContent = word;
      span.style.setProperty('--word-delay', `${wordIndex * 150}ms`);
      fragment.append(span);
      wordIndex += 1;
    });
    phrase.replaceChildren(fragment);
    phrase.classList.add('motion-phrase');
    const animatedWords = phrase.querySelectorAll('.motion-word');
    const lastWord = animatedWords[animatedWords.length - 1];
    phrase.addEventListener('animationend', event => {
      if (event.target !== lastWord || event.animationName !== 'word-arrival') return;
      if (motionPreference.matches) return;
      // Finish the entire phrase, pause briefly, then replay the same entrance.
      const timer = window.setTimeout(() => {
        phraseReplayTimers.delete(timer);
        if (motionPreference.matches) return;
        animatedWords.forEach(word => {
          word.getAnimations().forEach(animation => {
            if (animation.animationName === 'word-arrival') animation.currentTime = 0;
          });
        });
      }, 5000);
      phraseReplayTimers.add(timer);
    });
  });

  const revealElements = document.querySelectorAll(
    '.section-label, .area-card, .principle-grid article, .person, .steps-list > div, .floating-note, .hero-actions'
  );
  revealElements.forEach(element => {
    element.classList.add('motion-reveal');
    const siblings = [...element.parentElement.children].filter(sibling =>
      sibling.matches('.area-card, .principle-grid article, .person, .steps-list > div')
    );
    const index = Math.max(0, siblings.indexOf(element));
    element.style.setProperty('--reveal-delay', `${index * 180}ms`);
  });
  const motionTargets = [...keyPhrases, ...revealElements];
  const phraseObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-in-view');
      target.classList.toggle('motion-paused', !isIntersecting);
    });
  }, { threshold: 0.15 });
  motionTargets.forEach(element => phraseObserver.observe(element));

  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    phraseObserver.disconnect();
    phraseReplayTimers.forEach(timer => window.clearTimeout(timer));
    phraseReplayTimers.clear();
    motionTargets.forEach(phrase => {
      phrase.classList.remove('is-in-view', 'motion-paused');
    });
  });
}
