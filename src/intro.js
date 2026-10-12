const intro = document.getElementById('intro');
const title = document.querySelector('#app h1');

// 2.5s delay
window.addEventListener('load', () => {
  setTimeout(() => {
    intro.classList.add('fade-out');
    title.classList.add('show');


    setTimeout(() => intro.remove(), 1500);
  }, 750);
});

intro.addEventListener('click', () => {
  intro.classList.add('fade-out');
  title.classList.add('show');
  setTimeout(() => intro.remove(), 1500);
});
