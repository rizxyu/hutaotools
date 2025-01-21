window.addEventListener('DOMContentLoaded', () => {
// Save & load theme
const toggle = document.querySelector('.theme-controller');

toggle.addEventListener('change', () => {
    localStorage.setItem('theme', toggle.checked ? toggle.value : '');
    navbar.classList.toggle("dark-theme");
    navbar.classList.toggle("shadow-xl", "rounded-full");
    document.querySelectorAll(".nav-btn").forEach(btn => {
  const currentColor = getComputedStyle(btn).color;
  const textMode = document.getElementById("switch-mode-text");
  btn.style.color = currentColor === "rgb(29, 35, 42)" ? "#ffffff" : "#1d232a"; 
  if(currentColor == "rgb(29, 35, 42)") {
    textMode.textContent = "Mode Gelap"
  } else {
    textMode.textContent = "Mode Terang"
  }
});
});

// Load themes
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    toggle.checked = true;
    navbar.classList.toggle("dark-theme");
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.style.color = "#1d232a";
      
      const currentColor = getComputedStyle(btn).color;
      const textMode = document.getElementById("switch-mode-text");
      if(currentColor == "rgb(29, 35, 42)") {
       textMode.textContent = "Mode Gelap"
      } else {
       textMode.textContent = "Mode Terang"
  }
    })
}

});