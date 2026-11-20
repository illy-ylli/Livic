const appView = document.getElementById('app');
const openLyrics = document.getElementById('open-lyrics');
const homeHeading = openLyrics.closest('h1');
const lyricsLine = document.getElementById('playback-lyrics');
const playbackDetails = document.getElementById('playback');

function setLyricsView(active) {
  appView.classList.toggle('lyrics-view', active);
  homeHeading.hidden = active;
  lyricsLine.hidden = !active;
  if (active) {
    playbackDetails.tabIndex = 0;
    lyricsLine.focus();
  } else {
    playbackDetails.removeAttribute('tabindex');
    openLyrics.classList.add('return-focus');
    openLyrics.focus();
  }
}

openLyrics.addEventListener('blur', () => openLyrics.classList.remove('return-focus'));
openLyrics.addEventListener('click', () => setLyricsView(true));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && appView.classList.contains('lyrics-view')) {
    setLyricsView(false);
  }
});
