const track = document.getElementById('playback-track');
const state = document.getElementById('playback-state');
const time = document.getElementById('playback-time');

let sample = {};
let anchor = 0;
let receivedAt = 0;

function formatTime(seconds) {
  const wholeSeconds = Math.floor(seconds);
  return [Math.floor(wholeSeconds / 60), String(wholeSeconds % 60).padStart(2, '0')].join(':');
}

function renderTime() {
  if (!Number.isFinite(sample.position)) {
    time.textContent = '';
    return;
  }

  const elapsed = sample.state === 'Playing' ? (performance.now() - receivedAt) / 1000 : 0;
  const duration = sample.duration > 0 ? sample.duration : Infinity;
  const position = Math.min(duration, Math.max(0, anchor + elapsed));
  time.textContent = Number.isFinite(duration)
    ? formatTime(position) + ' / ' + formatTime(duration)
    : formatTime(position);
}

async function refreshPlayback() {
  try {
    sample = await window.playback.getSample();
    const age = sample.state === 'Playing' && sample.updatedAt > 0
      ? Math.max(0, (Date.now() - sample.updatedAt) / 1000)
      : 0;
    anchor = sample.position + age;
    receivedAt = performance.now();
    track.textContent = [sample.artist, sample.title].filter(Boolean).join(' — ');
    state.textContent = sample.state;
    renderTime();
  } catch (error) {
    sample = {};
    track.textContent = '';
    state.textContent = 'Windows playback unavailable';
    renderTime();
  }
  setTimeout(refreshPlayback, 500);
}

refreshPlayback();
setInterval(renderTime, 100);
