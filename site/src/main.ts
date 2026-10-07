import './style.css';
import { confetti, countUp, karaoke, revealStage } from './fx';
import { sendBet } from './send';
import { createSlot, type Slot } from './slot';
import { playApplause, playFanfare } from './sound';
import { loadBet, saveBet } from './storage';
import landscapeMp4 from './media/hero-landscape.mp4';
import landscapeWebm from './media/hero-landscape.webm';
import portraitMp4 from './media/hero-portrait.mp4';
import portraitWebm from './media/hero-portrait.webm';
import { SONGS_COUNT, type Bet, type Song } from './types';

const $ = <T extends Element>(selector: string): T => document.querySelector<T>(selector)!;

const video = $<HTMLVideoElement>('[data-hero-video]');
const form = $<HTMLFormElement>('[data-form]');
const nameInput = $<HTMLInputElement>('[data-name]');
const submit = $<HTMLButtonElement>('[data-submit]');
const error = $<HTMLElement>('[data-error]');
const done = $<HTMLElement>('[data-done]');

let updated = false;

const songsWord = (n: number): string => (n === 1 ? 'песня' : n < 5 ? 'песни' : 'песен');
const nameValid = (): boolean => nameInput.value.trim().split(/\s+/).length >= 2;

const slots: Slot[] = Array.from({ length: SONGS_COUNT }, (_, index) =>
  createSlot({
    index,
    onChange: () => refresh(),
    taken: () => slots.map((s) => s.value()?.label ?? ''),
  }),
);
$('[data-slots]').append(...slots.map((s) => s.el));

const songs = (): Song[] => slots.flatMap((s) => s.value() ?? []);

function refresh(): void {
  const missing = SONGS_COUNT - songs().length;
  submit.disabled = missing > 0 || !nameValid();
  submit.textContent =
    missing > 0 ? `Ещё ${missing} ${songsWord(missing)}` : nameValid() ? 'Отправить ставку 🎤' : 'Впиши ФИО';
}

const showDone = ({ bet, celebrate }: { bet: Bet; celebrate: boolean }): void => {
  const words = bet.name.split(/\s+/);
  form.hidden = true;
  done.hidden = false;
  $('[data-done-name]').textContent = words[1] ?? words[0];
  $('[data-records]').replaceChildren(
    ...bet.songs.map((song) => {
      const item = document.createElement('li');
      item.innerHTML = `<div class="vinyl" data-filled="true"><img class="vinyl__cover" alt=""></div><span></span>`;
      const img = item.querySelector('img')!;
      img.hidden = !song.cover;
      img.src = song.cover ?? '';
      item.querySelector('span')!.textContent = song.label;
      return item;
    }),
  );
  countUp($('[data-score]'));
  if (!celebrate) return;
  playFanfare();
  playApplause();
  confetti();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const bet: Bet = { name: nameInput.value.trim().replace(/\s+/g, ' '), songs: songs() };
  submit.disabled = true;
  submit.textContent = 'Отправляю…';
  error.textContent = '';
  try {
    await sendBet({ bet, updated });
    saveBet(bet);
    showDone({ bet, celebrate: true });
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {
    error.textContent = 'Не получилось отправить 😢 Проверь интернет и попробуй ещё раз.';
    refresh();
  }
});

$('[data-edit]').addEventListener('click', () => {
  const bet = loadBet();
  updated = true;
  done.hidden = true;
  form.hidden = false;
  nameInput.value = bet?.name ?? '';
  bet?.songs.forEach((song, i) => slots[i]?.set(song));
  form.scrollIntoView({ behavior: 'smooth' });
});

nameInput.addEventListener('input', refresh);
video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });

const saved = loadBet();
if (saved) {
  updated = true;
  showDone({ bet: saved, celebrate: false });
} else revealStage();
refresh();
karaoke($('[data-karaoke]'));

// Only offer sources for the current orientation, so a failed decode never falls through to the other one.
const portrait = matchMedia('(orientation: portrait)');
const loadHero = (): void => {
  const sources = portrait.matches ? [portraitWebm, portraitMp4] : [landscapeWebm, landscapeMp4];
  video.replaceChildren(...sources.map((src) => Object.assign(document.createElement('source'), { src })));
  video.load();
};
loadHero();
portrait.addEventListener('change', loadHero);
