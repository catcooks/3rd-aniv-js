/* Background music: starts once the page and bgm.mp3 have finished loading. */
(() => {
  "use strict";

  const SRC = "assets/bgm.mp3"; // put bgm.mp3 next to index.html (or change the path)
  const VOLUME = 0.5;    // 0 – 1

  const audio = new Audio(SRC);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = "auto";

  let pageReady = false;
  let audioReady = false;
  let started = false;
  let userPaused = false; // the person pressed the music button to stop it

  /* ── small floating on/off button ── */
  const ON =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
  const OFF =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>';

  const style = document.createElement("style");
  style.textContent = `
    .bgm-btn {
      position: fixed; top: 14px; right: 14px; z-index: 50;
      width: 42px; height: 42px; padding: 0;
      display: grid; place-items: center;
      border: 1px solid rgba(240, 180, 91, 0.35); border-radius: 50%;
      background: rgba(20, 36, 29, 0.75); color: #f0b45b;
      backdrop-filter: blur(6px); cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .bgm-btn:focus-visible { outline: 2px solid #f1ede4; outline-offset: 3px; }
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "bgm-btn";
  btn.setAttribute("aria-label", "Toggle music");
  btn.innerHTML = OFF;
  btn.hidden = true; // shown once the music is ready
  document.body.appendChild(btn);

  const refreshButton = () => {
    const playing = !audio.paused;
    btn.innerHTML = playing ? ON : OFF;
    btn.setAttribute("aria-pressed", String(playing));
  };

  /* ── start logic ── */
  const tryPlay = () => {
    if (started || userPaused || !pageReady || !audioReady) return;
    audio
      .play()
      .then(() => {
        started = true;
        refreshButton();
      })
      .catch(() => {
        // autoplay was blocked – the first tap / key press will start it
      });
  };

  const maybeReady = () => {
    if (!pageReady || !audioReady) return;
    btn.hidden = false;
    tryPlay();
  };

  window.addEventListener("load", () => {
    pageReady = true;
    maybeReady();
  });
  // load event may already have fired if this script runs late
  if (document.readyState === "complete") pageReady = true;

  if (audio.readyState >= 4) {
    audioReady = true;
  } else {
    audio.addEventListener(
      "canplaythrough",
      () => {
        audioReady = true;
        maybeReady();
      },
      { once: true },
    );
  }
  audio.addEventListener("error", () =>
    console.warn("bgm.mp3 could not be loaded – is it next to index.html?"),
  );
  maybeReady();

  // browsers only allow sound after a user gesture, so retry on the first one
  const gestures = ["pointerdown", "touchend", "keydown"];
  const onGesture = (e) => {
    if (e.target === btn || btn.contains(e.target)) return; // button handles itself
    tryPlay();
    if (started) gestures.forEach((g) => window.removeEventListener(g, onGesture));
  };
  gestures.forEach((g) => window.addEventListener(g, onGesture));

  /* ── controls ── */
  btn.addEventListener("click", () => {
    if (audio.paused) {
      userPaused = false;
      audio.play().then(() => {
        started = true;
        refreshButton();
      }).catch(() => {});
    } else {
      userPaused = true;
      audio.pause();
      refreshButton();
    }
  });

  audio.addEventListener("play", refreshButton);
  audio.addEventListener("pause", refreshButton);

  // pause when the tab is hidden, resume when it comes back
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (started && !userPaused) audio.play().catch(() => {});
  });
})();
