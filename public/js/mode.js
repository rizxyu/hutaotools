document.addEventListener("DOMContentLoaded", () => {
  const modeToggleButton = document.getElementById('switch-mode');

  function toggleMode() {
    document.body.classList.toggle('white-mode');
    const cardText = modeToggleButton.querySelector('.card-text');
    
    if (document.body.classList.contains('white-mode')) {
      cardText.textContent = 'Mode Gelap'; 
    } else {
      cardText.textContent = 'Mode Terang'; //
    }
  }

  if (modeToggleButton) {
    modeToggleButton.addEventListener('click', toggleMode);
  }
});