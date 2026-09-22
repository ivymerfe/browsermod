(function () {
  window.addEventListener(
    "keydown",
    function (e) {
      const justKey = !e.altKey && !e.ctrlKey && !e.metaKey;
      const isPaste = (e.ctrlKey || e.metaKey) && e.code === "KeyV";
      if (justKey || isPaste) {
        if (
          this.document.activeElement.tagName !== "INPUT" &&
          this.document.activeElement.tagName !== "TEXTAREA"
        ) {
          const inputField = this.document.querySelector(window.INPUT_SELECTOR);
          if (inputField) {
            inputField.focus();
          }
        }
      }
    },
    true,
  );
})();
