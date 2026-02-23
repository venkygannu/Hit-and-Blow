export async function createCpuGame(difficulty: 'easy' | 'medium' | 'hard') {
  const res = await fetch('/api/cpu/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ gameId: string; difficulty: string }>;
}

export async function submitCpuGuess(gameId: string, guess: string) {
  const res = await fetch('/api/cpu/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, guess }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ hits: number; blows: number; win: boolean }>;
}

export async function getCpuMove(gameId: string) {
  const res = await fetch(`/api/cpu/move/${gameId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ guess: string; hits: number; blows: number; win: boolean }>;
}
