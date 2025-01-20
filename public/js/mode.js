window.addEventListener('DOMContentLoaded', () => {
// Save & load theme
const toggle = document.querySelector('.theme-controller');

toggle.addEventListener('change', () => {
    localStorage.setItem('theme', toggle.checked ? toggle.value : '');
    const modeText = document.getElementById("switch-mode-text");
    modeText.textContent = (modeText.textContent === 'Mode Terang') ? 'Mode Gelap' : 'Mode Terang';
});

// Load themes
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    toggle.checked = true;
    document.getElementById("switch-mode-text").textContent = "Mode Terang";
    };
});