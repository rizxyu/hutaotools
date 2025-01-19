document.addEventListener("DOMContentLoaded", () => {
  const modeToggleButton = document.getElementById('switch-mode');
  const cardText = modeToggleButton.querySelector('.card-text');
  
  if(!localStorage.getItem("mode")) {
    document.body.classList.add('white-mode');
  } else if(localStorage.getItem("mode") == "gelap") {
    document.body.classList.remove('white-mode');
    cardText.textContent = 'Mode Terang'; 
    }
  
    
modeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('white-mode');
    cardText.textContent = (cardText.textContent === 'Mode Terang') ? 'Mode Gelap' : 'Mode Terang';
    
    if(localStorage.getItem("mode")) {
      localStorage.removeItem("mode");
    } else {
      localStorage.setItem("mode", "gelap");
    }
  });
    
})