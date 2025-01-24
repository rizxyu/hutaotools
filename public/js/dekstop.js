document.addEventListener("DOMContentLoaded", () => {
  if(!navigator.userAgent.includes("Mobile")) {
    navbar.classList.replace("left-0", "right-5");
    navbar.classList.replace("w-full", "w-2/3");
  }
})