document.getElementById('themeToggle').onclick = () => {
  document.body.classList.toggle('dark');
};

ScrollReveal().reveal('.content_instance', {
  distance: '50px',
  duration: 600,
  easing: 'ease-in-out',
  origin: 'bottom',
  interval: 100
});




