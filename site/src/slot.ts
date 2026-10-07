import { gsap } from 'gsap';
import { popVinyl } from './fx';
import { HITS } from './hits';
import { searchSongs } from './itunes';
import { playClick } from './sound';
import type { Song } from './types';

export type Slot = { el: HTMLLIElement; value: () => Song | null; set: (song: Song | null) => void };

type SlotOptions = { index: number; onChange: () => void; taken: () => string[] };

const template = document.querySelector<HTMLTemplateElement>('#slot')!;

export const createSlot = ({ index, onChange, taken }: SlotOptions): Slot => {
  const el = template.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
  const vinyl = el.querySelector<HTMLElement>('.vinyl')!;
  const cover = el.querySelector<HTMLImageElement>('.vinyl__cover')!;
  const input = el.querySelector<HTMLInputElement>('.slot__input')!;
  const list = el.querySelector<HTMLUListElement>('.suggest')!;
  const dice = el.querySelector<HTMLButtonElement>('.dice')!;
  el.querySelector('.vinyl__num')!.textContent = String(index + 1).padStart(2, '0');

  let song: Song | null = null;
  let options: Song[] = [];
  let active = -1;
  let search: AbortController | null = null;
  let debounce = 0;

  const set = (next: Song | null): void => {
    song = next;
    input.value = next?.label ?? '';
    cover.hidden = !next?.cover;
    cover.src = next?.cover ?? '';
    vinyl.dataset.filled = String(Boolean(next));
    onChange();
  };

  const close = (): void => {
    list.hidden = true;
    active = -1;
  };

  const choose = (picked: Song): void => {
    set(picked);
    close();
    playClick();
    popVinyl(vinyl);
  };

  const render = (): void => {
    list.replaceChildren(
      ...options.map((option, i) => {
        const item = document.createElement('li');
        item.className = 'suggest__item';
        item.role = 'option';
        item.ariaSelected = String(i === active);
        // Option 0 is always what the person typed, for songs missing from the catalogue.
        item.innerHTML = i ? `<img alt="" loading="lazy"><span></span>` : `<b>✍️</b><span></span>`;
        if (i) item.querySelector('img')!.src = option.cover ?? '';
        item.querySelector('span')!.textContent = i ? option.label : `Оставить как написал: «${option.label}»`;
        // click (not pointerdown) so a swipe over the list scrolls instead of picking.
        item.addEventListener('click', () => choose(option));
        return item;
      }),
    );
    list.hidden = false;
  };

  input.addEventListener('input', () => {
    const term = input.value.trim();
    song = term ? { label: term, cover: null } : null;
    cover.hidden = true;
    vinyl.dataset.filled = 'false';
    onChange();
    clearTimeout(debounce);
    search?.abort();
    if (term.length < 2) return close();
    debounce = window.setTimeout(async () => {
      search = new AbortController();
      try {
        const found = await searchSongs(term, search.signal);
        const typed: Song = { label: term, cover: null };
        options = [typed, ...found.filter((f) => f.label.toLowerCase() !== term.toLowerCase())];
        active = -1;
        if (document.activeElement === input) render();
      } catch {
        // Aborted or offline — free text still works.
      }
    }, 250);
  });

  input.addEventListener('keydown', (e) => {
    if (list.hidden || !options.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      render();
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape') close();
  });

  // Keep focus in the input while tapping the list, so blur doesn't close it before the click lands.
  list.addEventListener('mousedown', (e) => e.preventDefault());
  input.addEventListener('blur', close);
  input.addEventListener('focus', () => options.length && input.value.trim().length > 1 && render());

  dice.addEventListener('click', async () => {
    const used = taken().map((label) => label.toLowerCase());
    const pool = HITS.filter((hit) => !used.includes(hit.toLowerCase()));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const reel = { step: 0 };
    song = { label: pick, cover: null }; // reserve now so parallel rolls in other slots skip it
    dice.disabled = true;
    close();
    gsap.to(dice, { rotate: '+=720', duration: 1.1, ease: 'power3.out' });
    await gsap.to(reel, {
      step: 16,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => void (input.value = pool[(Math.floor(reel.step) * 7) % pool.length]),
    });
    dice.disabled = false;
    choose({ label: pick, cover: null });
    const [found] = await searchSongs(pick).catch((): Song[] => []);
    if (found?.cover && song?.label === pick) set({ label: pick, cover: found.cover });
  });

  return { el, value: () => song, set };
};
