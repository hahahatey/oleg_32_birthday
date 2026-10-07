import type { Bet } from './types';

type Web3FormsResponse = { success: boolean; message: string };

export const sendBet = async ({ bet, updated }: { bet: Bet; updated: boolean }): Promise<void> => {
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: import.meta.env.VITE_WEB3FORMS_KEY,
      subject: `${updated ? '[ОБНОВЛЕНО] ' : ''}🎤 Олег 32 — ${bet.name}`,
      from_name: 'Олег 32 · Караоке',
      'ФИО': bet.name,
      'Песни': bet.songs.map((s, i) => `${i + 1}. ${s.label}`).join('\n'),
    }),
  });
  const data: Web3FormsResponse = await res.json();
  if (!data.success) throw new Error(data.message);
};
