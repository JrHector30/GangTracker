export function formatSeconds(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getRemainingRobTime(spot) {
  if (spot.status !== 'robbing' || !spot.robStartedAt) return { remaining: 0, percent: 0 };
  const elapsed = (Date.now() - spot.robStartedAt) / 1000;
  const total = spot.robDuration || 60;
  const remaining = Math.max(0, total - elapsed);
  const percent = Math.min(100, Math.round((elapsed / total) * 100));
  return { remaining: Math.ceil(remaining), percent };
}

export function getRemainingCooldown(spot) {
  if (spot.status !== 'cooldown' || !spot.cooldownStartedAt) return { remaining: 0, percent: 100 };
  const elapsed = (Date.now() - spot.cooldownStartedAt) / 1000;
  const total = spot.cooldownDuration || 1800;
  const remaining = Math.max(0, total - elapsed);
  const percent = Math.min(100, Math.round((remaining / total) * 100));
  return { remaining: Math.ceil(remaining), percent };
}
