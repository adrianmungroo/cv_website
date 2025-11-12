/**
 * CV Website - Main JavaScript
 * Handles dynamic content updates and interactions
 */

(function () {
  "use strict";

  /**
   * Initialize the application
   */
  function init() {
    updateYear();
    // Add any other initialization code here
  }

  /**
   * Auto-update copyright year in footer
   */
  function updateYear() {
    const yearElement = document.getElementById("y");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

