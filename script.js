document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".sidebar-button");
  const content = document.querySelector(".content");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".content-box").forEach((box) => {
    observer.observe(box);
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const section = button.getAttribute("data-section");
      const targetElement = document.getElementById(section);

      if (targetElement) {
        content.scrollTo({
          top: targetElement.offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
});
