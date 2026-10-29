(() => {
  const TOTAL = 10;        // 0.png – 9.png
  const INTERVAL = 4000;   // ms each photo stays
  const PATH = "assets/us/";

  const frame = document.getElementById("slideFrame");
  const dotsBox = document.getElementById("slideDots");
  if (!frame) return;

  const slides = [];
  const dots = [];

  for (let i = 0; i < TOTAL; i++) {
    const img = document.createElement("img");
    img.src = `${PATH}${i}.jpg`;
    img.alt = `Memory ${i + 1}`;
    img.className = "slideshow__img";
    img.loading = i === 0 ? "eager" : "lazy";
    // hide the slide if an image is missing so there's no blank frame
    img.onerror = () => img.remove();
    frame.appendChild(img);
    slides.push(img);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slideshow__dot";
    dot.setAttribute("aria-label", `Show photo ${i + 1}`);
    dot.addEventListener("click", () => {
      show(i);
      restart();
    });
    dotsBox.appendChild(dot);
    dots.push(dot);
  }

  let current = 0;
  let timer = null;

  function show(n) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (n + TOTAL) % TOTAL;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  }

  function start() {
    timer = setInterval(() => show(current + 1), INTERVAL);
  }
  function restart() {
    clearInterval(timer);
    start();
  }

  show(0);

  // only run while the section is on screen
  const io = new IntersectionObserver(
    ([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) start();
    },
    { threshold: 0.3 }
  );
  io.observe(document.getElementById("slideshow"));

  // pause on hover
  frame.addEventListener("mouseenter", () => clearInterval(timer));
  frame.addEventListener("mouseleave", restart);
})();