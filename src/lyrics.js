function parseSyncedLyrics(source) {
  const offset = Number(source.match(/^\[offset:([+-]?\d+)\]/mi)?.[1] ?? 0) / 1000;
  const lines = [];
  for (const row of source.split(/\r?\n/)) {
    const tags = row.match(/^(?:\[\d+:\d{2}(?:\.\d+)?\])+/)?.[0];
    if (!tags) continue;

    const text = row.slice(tags.length).trim();
    for (const [, minutes, seconds] of tags.matchAll(/\[(\d+):(\d{2}(?:\.\d+)?)\]/g)) {
      lines.push({ start: Number(minutes) * 60 + Number(seconds) - offset, text });
    }
  }
  return lines.sort((a, b) => a.start - b.start);
}

function createLyricsDisplay(element) {
  let trackKey = '';
  let request;
  let lines = [];
  let position = 0;
  let activeLine;
  let wordElements = [];

  function render(seconds) {
    position = seconds;
    if (!lines.length) return;

    const line = lines.findLast(({ start, end }) => start <= seconds && (end === undefined || seconds < end));
    if (line !== activeLine) {
      activeLine = line;
      element.textContent = line?.words ? '' : line?.text ?? '';
      wordElements = (line?.words ?? []).map(({ text, start }) => {
        const span = document.createElement('span');
        span.className = 'lyric-word';
        span.textContent = text;
        element.append(span);
        return { span, start };
      });
    }

    for (const { span, start } of wordElements) {
      span.classList.toggle('revealed', seconds >= start);
    }
  }

  async function setTrack({ title, artist, album, duration }) {
    const key = title && artist && Number.isFinite(duration) && duration >= 1
      ? JSON.stringify([title, artist, album, Math.round(duration)])
      : '';
    if (key === trackKey) return;

    trackKey = key;
    request?.abort();
    activeLine = null;
    wordElements = [];
    lines = [];
    element.textContent = key ? 'Looking for synced lyrics…' : '';
    if (!key) return;

    const controller = new AbortController();
    request = controller;
    const query = new URLSearchParams({
      track_name: title,
      artist_name: artist,
      album_name: album ?? '',
      duration: String(Math.round(duration))
    });

    try {
      const response = await fetch('https://lrclib.net/api/get?' + query, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)])
      });
      if (controller.signal.aborted) return;
      if (response.status === 404) {
        element.textContent = 'No synced lyrics found';
        return;
      }
      if (!response.ok) throw new Error('Lyrics request failed');

      const record = await response.json();
      if (controller.signal.aborted) return;
      let wordTimedLines = [];
      if (record.hasWordSync && typeof record.lyricsfile === 'string') {
        try {
          wordTimedLines = await window.playback.parseLyricsfile(record.lyricsfile);
        } catch {
          // Keep line-synced lyrics available if the Lyricsfile cannot be read.
        }
      }
      if (controller.signal.aborted) return;
      lines = wordTimedLines.some(line => line.words)
        ? wordTimedLines
        : parseSyncedLyrics(typeof record.syncedLyrics === 'string' ? record.syncedLyrics : '');
      element.textContent = record.instrumental ? 'Instrumental' : 'No synced lyrics found';
      render(position);
    } catch {
      if (!controller.signal.aborted) element.textContent = 'Could not load lyrics';
    }
  }

  return { setTrack, render };
}
