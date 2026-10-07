import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Karaoke-screen lyric line: a bouncing ball hops word to word while each word fills with colour. */
export const karaoke = (line: HTMLElement): void => {
  const words = (line.textContent ?? '').trim().split(/\s+/).map((text) => {
    const span = document.createElement('span');
    span.className = 'karaoke__word';
    span.textContent = text;
    return span;
  });
  const ball = document.createElement('span');
  ball.className = 'karaoke__ball';
  line.replaceChildren(...words, ball);
  gsap.set(ball, { xPercent: -50, yPercent: -100, opacity: 0 });

  const sing = (): void => {
    const tl = gsap.timeline({ onComplete: () => void gsap.delayedCall(0.6, sing) });
    tl.set(words, { '--p': '0%' }).to(ball, { opacity: 1, duration: 0.3 });
    words.forEach((word) => {
      const x = word.offsetLeft + word.offsetWidth / 2;
      const y = word.offsetTop - 6;
      tl.to(ball, { x, duration: 0.26, ease: 'power1.inOut' })
        .to(ball, { keyframes: { y: [y - 34, y], easeEach: 'sine.inOut' }, duration: 0.26 }, '<')
        .to(word, { '--p': '100%', duration: 0.18 + (word.textContent ?? '').length * 0.05, ease: 'none' });
    });
    tl.to(ball, { opacity: 0, duration: 0.3 }, '+=0.6').to(words, { '--p': '0%', duration: 0.4, stagger: 0.03 });
  };
  gsap.delayedCall(1.2, sing);
};

/** Slots and title slide up as the karaoke screen scrolls into view. */
export const revealStage = (): void => {
  gsap.from('.screen > form > *, .screen__bar', {
    y: 40,
    opacity: 0,
    stagger: 0.07,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.screen', start: 'top 75%' },
  });
};

export const popVinyl = (vinyl: Element): void => {
  gsap.fromTo(vinyl, { scale: 0.6, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.2)' });
};

/** Karaoke-machine score counter. */
export const countUp = (el: HTMLElement): void => {
  const score = { value: 0 };
  gsap.to(score, {
    value: 100,
    duration: 1.6,
    ease: 'power2.out',
    onUpdate: () => void (el.textContent = String(Math.round(score.value)).padStart(3, '0')),
  });
};

/** Burst of notes and mics from the screen centre that falls with gravity. */
export const confetti = (): void => {
  const glyphs = ['♪', '♫', '♬', '🎤', '✨', '🎶'];
  const colors = ['#ff2bd6', '#00f0ff', '#ffe14d', '#ffffff'];
  for (let i = 0; i < 60; i++) {
    const note = document.createElement('span');
    note.className = 'confetti';
    note.textContent = glyphs[i % glyphs.length];
    note.style.color = colors[i % colors.length];
    document.body.append(note);
    const angle = Math.random() * Math.PI * 2;
    const power = 180 + Math.random() * 320;
    gsap
      .timeline({ onComplete: () => note.remove() })
      .to(note, { x: Math.cos(angle) * power, y: Math.sin(angle) * power - 200, rotate: gsap.utils.random(-200, 200), duration: 0.8, ease: 'power3.out' })
      .to(note, { y: '+=600', opacity: 0, duration: 1.4, ease: 'power2.in' });
  }
};
