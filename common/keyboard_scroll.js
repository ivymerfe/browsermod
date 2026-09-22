(function () {
  const SCROLL_SPEED = 22;
  const KEY_UP = "KeyD";
  const KEY_DOWN = "KeyF";

  let scrollAnimationFrame = null;
  let scrollElement = null;
  let directionUp = 0;
  let directionDown = 0;

  function scrollUp() {
    if (scrollElement) {
      scrollElement.scrollBy(0, -SCROLL_SPEED);
      scrollAnimationFrame = requestAnimationFrame(scrollUp);
    }
  }
  function scrollDown() {
    if (scrollElement) {
      scrollElement.scrollBy(0, SCROLL_SPEED);
      scrollAnimationFrame = requestAnimationFrame(scrollDown);
    }
  }
  function stopScrolling() {
    if (scrollAnimationFrame) {
      cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = null;
    }
  }
  function updateScrolling() {
    const dir = directionUp - directionDown;
    if (dir === 0) {
      stopScrolling();
      return;
    }
    if (scrollAnimationFrame) return;
    scrollElement = document.querySelector(window.SCROLL_SELECTOR);
    if (dir > 0) {
      scrollUp();
    } else {
      scrollDown();
    }
  }

  window.addEventListener(
    "keydown",
    function (e) {
      const special = (e.ctrlKey || e.altKey) && !e.shiftKey;
      if (special && e.code === KEY_UP) {
        if (!e.repeat) {
          directionUp = 1;
          updateScrolling();
        }
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      if (special && e.code === KEY_DOWN) {
        if (!e.repeat) {
          directionDown = 1;
          updateScrolling();
        }
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );

  window.addEventListener(
    "keyup",
    function (e) {
      const special = (e.ctrlKey || e.altKey) && !e.shiftKey;
      if (special && e.code === KEY_UP) {
        directionUp = 0;
        updateScrolling();
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      if (special && e.code === KEY_DOWN) {
        directionDown = 0;
        updateScrolling();
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      if (!e.ctrlKey && !e.altKey) {
        directionUp = 0;
        directionDown = 0;
        updateScrolling();
      }
    },
    true,
  );

  window.addEventListener(
    "blur",
    () => {
      directionUp = 0;
      directionDown = 0;
      updateScrolling();
    },
    true,
  );
})();
