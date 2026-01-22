/**
 * CV Website - Main JavaScript
 * Handles dynamic content updates and interactions
 */

(function () {
  "use strict";

  let selectedTags = new Set();
  let allTags = new Map();
  let tagFilterPanel = null;
  let tagList = null;
  let tagSearch = null;
  let tagModes = new Map(); // Store whether each tag is in OR or AND mode

  /**
   * Initialize the application
   */
  function init() {
    updateYear();
    initTabs();
    initTagFilter();
    initWidthToggle();
    initThemeToggle();
    initHashNavigation();
    initSeeCVToggle();
  }

  /**
   * Initialize tab switching functionality
   */
  function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.dataset.tab;

        // Remove active class from all buttons and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        // Add active class to clicked button and corresponding content
        button.classList.add("active");
        const activeContent = document.getElementById(tabId);
        if (activeContent) {
          activeContent.classList.add("active");
        }
      });
    });
  }

  /**
   * Switch to a specific tab by its ID
   */
  function switchToTab(tabId) {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);

    if (!targetButton || !targetContent) return;

    // Remove active class from all buttons and contents
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to target button and content
    targetButton.classList.add("active");
    targetContent.classList.add("active");
  }

  /**
   * Initialize hash navigation to handle internal links across tabs
   */
  function initHashNavigation() {
    // Handle clicks on internal links
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#']");
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const targetId = hash.substring(1);
      const targetElement = document.getElementById(targetId);

      if (!targetElement) return;

      // Find which tab contains the target element
      const parentTab = targetElement.closest(".tab-content");
      if (!parentTab) return;

      e.preventDefault();

      // Switch to the correct tab
      switchToTab(parentTab.id);

      // Wait a moment for the tab to become visible, then scroll and expand
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        
        // Expand the "More info" section if it exists and is collapsed
        expandDetailsSection(targetElement);
      }, 50);
    });

    // Also handle direct hash navigation (e.g., from URL)
    function handleHash() {
      const hash = window.location.hash;
      if (!hash || hash === "#") return;

      const targetId = hash.substring(1);
      const targetElement = document.getElementById(targetId);

      if (!targetElement) return;

      // Find which tab contains the target element
      const parentTab = targetElement.closest(".tab-content");
      if (!parentTab) return;

      // Switch to the correct tab
      switchToTab(parentTab.id);

      // Wait a moment for the tab to become visible, then scroll and expand
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        
        // Expand the "More info" section if it exists and is collapsed
        expandDetailsSection(targetElement);
      }, 100);
    }

    // Handle hash on page load
    if (window.location.hash) {
      handleHash();
    }

    // Handle hash changes
    window.addEventListener("hashchange", handleHash);
  }

  /**
   * Expand the details section of a target element if it's collapsed
   */
  function expandDetailsSection(targetElement) {
    // Find the toggle button within the target element or its parent item
    const itemElement = targetElement.closest(".item, .timeline-item") || targetElement;
    const toggleButton = itemElement.querySelector(".toggle-btn");
    
    if (!toggleButton) return;
    
    // Check if the details section is currently hidden
    const detailsSection = toggleButton.nextElementSibling;
    if (detailsSection && detailsSection.style.display === "none") {
      // Click the button to expand it
      toggleButton.click();
    }
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

  /**
   * Toggle publication details visibility
   */
  window.toggleDetails = function (button) {
    const details = button.nextElementSibling;
    const isHidden = details.style.display === "none";

    if (isHidden) {
      details.style.display = "block";
      button.textContent = "Less info ▲";
    } else {
      details.style.display = "none";
      button.textContent = "More info ▼";
    }
  };

  /**
   * Initialize tag filter functionality
   */
  function initTagFilter() {
    tagFilterPanel = document.getElementById("tag-filter-panel");
    tagList = document.getElementById("tag-list");
    tagSearch = document.getElementById("tag-search");
    const filterToggleBtn = document.getElementById("filter-toggle-btn");
    const closeFilterBtn = document.getElementById("close-filter-btn");
    const clearFiltersBtn = document.getElementById("clear-filters-btn");

    if (!tagFilterPanel || !tagList) return;

    // Collect all tags from the page
    collectTags();

    // Build the filter UI
    buildTagFilterUI();

    // Set up event listeners
    filterToggleBtn?.addEventListener("click", toggleFilterPanel);
    closeFilterBtn?.addEventListener("click", closeFilterPanel);
    clearFiltersBtn?.addEventListener("click", clearFilters);
    tagSearch?.addEventListener("input", filterTagList);

    // Close panel when clicking overlay
    const overlay = document.getElementById("tag-filter-overlay");
    overlay?.addEventListener("click", closeFilterPanel);
  }

  /**
   * Collect all tags from the page and map them to their parent items
   */
  function collectTags() {
    const tags = document.querySelectorAll(".tag");
    const items = document.querySelectorAll(".item, .timeline-item");

    items.forEach((item) => {
      const itemTags = Array.from(item.querySelectorAll(".tag")).map((tag) =>
        tag.textContent.trim()
      );

      if (itemTags.length > 0) {
        itemTags.forEach((tagText) => {
          if (!allTags.has(tagText)) {
            allTags.set(tagText, {
              count: 0,
              items: new Set(),
            });
          }
          allTags.get(tagText).count++;
          allTags.get(tagText).items.add(item);
        });
      }
    });
  }

  /**
   * Build the tag filter UI
   */
  function buildTagFilterUI() {
    if (!tagList) return;

    const sortedTags = Array.from(allTags.entries()).sort((a, b) => {
      // Sort by count (descending), then alphabetically
      if (b[1].count !== a[1].count) {
        return b[1].count - a[1].count;
      }
      return a[0].localeCompare(b[0]);
    });

    tagList.innerHTML = "";

    sortedTags.forEach(([tagText, data]) => {
      const filterItem = document.createElement("div");
      filterItem.className = "tag-filter-item";
      filterItem.dataset.tag = tagText;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `tag-${tagText.replace(/\s+/g, "-").toLowerCase()}`;
      checkbox.value = tagText;
      checkbox.addEventListener("change", handleTagToggle);

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = tagText;

      const count = document.createElement("span");
      count.className = "tag-count";
      count.textContent = data.count;

      // Add mode toggle button (ANY/MUST/NONE)
      const modeToggle = document.createElement("button");
      modeToggle.className = "tag-mode-toggle";
      modeToggle.textContent = "ANY";
      modeToggle.title = "Click to cycle: ANY → MUST → NONE";
      modeToggle.style.display = "none"; // Hidden by default
      modeToggle.addEventListener("click", (e) => {
        e.preventDefault();
        toggleTagMode(tagText, modeToggle);
      });

      filterItem.appendChild(checkbox);
      filterItem.appendChild(label);
      filterItem.appendChild(modeToggle);
      filterItem.appendChild(count);

      tagList.appendChild(filterItem);
    });
  }

  /**
   * Handle tag checkbox toggle
   */
  function handleTagToggle(e) {
    const tagText = e.target.value;
    const filterItem = e.target.closest(".tag-filter-item");
    const modeToggle = filterItem.querySelector(".tag-mode-toggle");

    if (e.target.checked) {
      selectedTags.add(tagText);
      // Initialize as ANY mode by default
      if (!tagModes.has(tagText)) {
        tagModes.set(tagText, "ANY");
      }
      // Show the mode toggle button
      modeToggle.style.display = "inline-flex";
    } else {
      selectedTags.delete(tagText);
      tagModes.delete(tagText);
      // Hide the mode toggle button
      modeToggle.style.display = "none";
    }

    applyFilters();
  }

  /**
   * Toggle tag between ANY, MUST, and NONE modes
   */
  function toggleTagMode(tagText, button) {
    const currentMode = tagModes.get(tagText) || "ANY";
    let newMode;
    
    // Cycle through: ANY → MUST → NONE → ANY
    if (currentMode === "ANY") {
      newMode = "MUST";
    } else if (currentMode === "MUST") {
      newMode = "NONE";
    } else {
      newMode = "ANY";
    }
    
    tagModes.set(tagText, newMode);
    
    button.textContent = newMode;
    button.classList.remove("must-mode", "none-mode");
    if (newMode === "MUST") {
      button.classList.add("must-mode");
    } else if (newMode === "NONE") {
      button.classList.add("none-mode");
    }
    
    applyFilters();
  }

  /**
   * Apply filters to show/hide items using three buckets
   * Logic: (ANY bucket) AND (MUST bucket) AND (NONE bucket)
   * - ANY bucket: item must have at least ONE of these tags
   * - MUST bucket: item must have ALL of these tags
   * - NONE bucket: item must have ZERO of these tags
   */
  function applyFilters() {
    const items = document.querySelectorAll(".item, .timeline-item");

    if (selectedTags.size === 0) {
      // Show all items if no tags selected
      items.forEach((item) => {
        item.classList.remove("filtered-out");
      });
      return;
    }

    // Separate selected tags into three buckets
    const anyTags = [];    // ANY bucket - must have at least one
    const mustTags = [];   // MUST bucket - must have all
    const noneTags = [];   // NONE bucket - must have none
    
    selectedTags.forEach((tag) => {
      const mode = tagModes.get(tag) || "ANY";
      if (mode === "ANY") {
        anyTags.push(tag);
      } else if (mode === "MUST") {
        mustTags.push(tag);
      } else if (mode === "NONE") {
        noneTags.push(tag);
      }
    });

    items.forEach((item) => {
      const itemTags = Array.from(item.querySelectorAll(".tag")).map((tag) =>
        tag.textContent.trim()
      );

      // If item has no tags, hide it when filters are active
      if (itemTags.length === 0) {
        item.classList.add("filtered-out");
        return;
      }

      let shouldShow = true;

      // NONE bucket: must NOT have ANY of these tags
      if (noneTags.length > 0) {
        const hasNoneTag = noneTags.some((tag) => itemTags.includes(tag));
        if (hasNoneTag) {
          shouldShow = false;
        }
      }

      // ANY bucket: must have at least ONE of these tags (if bucket not empty)
      if (shouldShow && anyTags.length > 0) {
        const hasAnyTag = anyTags.some((tag) => itemTags.includes(tag));
        if (!hasAnyTag) {
          shouldShow = false;
        }
      }

      // MUST bucket: must have ALL of these tags
      if (shouldShow && mustTags.length > 0) {
        const hasAllMustTags = mustTags.every((tag) => itemTags.includes(tag));
        if (!hasAllMustTags) {
          shouldShow = false;
        }
      }

      if (shouldShow) {
        item.classList.remove("filtered-out");
      } else {
        item.classList.add("filtered-out");
      }
    });
  }

  /**
   * Filter tag list based on search input
   */
  function filterTagList(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filterItems = tagList.querySelectorAll(".tag-filter-item");

    filterItems.forEach((item) => {
      const tagText = item.dataset.tag.toLowerCase();
      if (tagText.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }

  /**
   * Toggle filter panel open/close
   */
  function toggleFilterPanel() {
    const isOpen = tagFilterPanel?.classList.toggle("open");
    document.getElementById("filter-toggle-btn")?.classList.toggle("active");
    const overlay = document.getElementById("tag-filter-overlay");
    if (overlay) {
      overlay.classList.toggle("active", isOpen);
    }
  }

  /**
   * Close filter panel
   */
  function closeFilterPanel() {
    tagFilterPanel?.classList.remove("open");
    document.getElementById("filter-toggle-btn")?.classList.remove("active");
    const overlay = document.getElementById("tag-filter-overlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
    // Clear search when closing
    if (tagSearch) {
      tagSearch.value = "";
      filterTagList({ target: tagSearch });
    }
  }

  /**
   * Clear all selected filters
   */
  function clearFilters() {
    selectedTags.clear();
    tagModes.clear();
    const checkboxes = tagList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    const modeToggles = tagList.querySelectorAll('.tag-mode-toggle');
    modeToggles.forEach((toggle) => {
      toggle.style.display = "none";
      toggle.textContent = "ANY";
      toggle.classList.remove("must-mode", "none-mode");
    });
    applyFilters();
  }

  /**
   * Initialize width toggle functionality
   */
  function initWidthToggle() {
    const widthToggleBtn = document.getElementById("width-toggle-btn");
    const wrap = document.querySelector(".wrap");

    if (!widthToggleBtn || !wrap) return;

    // Load saved preference from localStorage
    const savedWidth = localStorage.getItem("layoutWidth");
    if (savedWidth === "wide") {
      wrap.classList.add("wide-layout");
      widthToggleBtn.classList.add("wide");
      widthToggleBtn.querySelector("span").textContent = "Narrow";
    }

    widthToggleBtn.addEventListener("click", () => {
      const isWide = wrap.classList.toggle("wide-layout");
      widthToggleBtn.classList.toggle("wide");

      // Update button text
      const buttonText = widthToggleBtn.querySelector("span");
      if (buttonText) {
        buttonText.textContent = isWide ? "Narrow" : "Wide";
      }

      // Save preference to localStorage
      localStorage.setItem("layoutWidth", isWide ? "wide" : "narrow");
    });
  }

  /**
   * Initialize "See CV" button to toggle between slimmed-down and full CV views
   */
  function initSeeCVToggle() {
    const seeCVBtn = document.getElementById("see-cv-btn");
    const downloadCVBtn = document.querySelector(".download-cv-btn");
    const tabContainer = document.querySelector(".tab-container");
    const wrap = document.querySelector(".wrap");
    const controlButtons = document.querySelector(".control-buttons");
    const footer = document.querySelector("footer");

    if (!seeCVBtn || !tabContainer || !wrap) return;

    seeCVBtn.addEventListener("click", () => {
      // Show the full CV content
      tabContainer.classList.remove("cv-hidden");
      wrap.classList.remove("cv-hidden");
      
      // Hide "See CV" button and show "Download CV" button
      seeCVBtn.classList.add("hidden");
      if (downloadCVBtn) {
        downloadCVBtn.classList.remove("hidden");
      }

      // Show control buttons container
      if (controlButtons) {
        controlButtons.classList.remove("hidden");
      }

      // Show footer
      if (footer) {
        footer.classList.remove("hidden");
      }

      // Smooth scroll to the CV content
      setTimeout(() => {
        tabContainer.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    });
  }

  /**
   * Initialize theme toggle functionality
   */
  function initThemeToggle() {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const root = document.documentElement;
    const sunIcon = themeToggleBtn?.querySelector(".sun-icon");
    const moonIcon = themeToggleBtn?.querySelector(".moon-icon");
    const buttonText = themeToggleBtn?.querySelector("span");

    if (!themeToggleBtn) return;

    // Function to update UI based on theme
    function updateThemeUI(theme) {
      if (theme === "dark") {
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
        buttonText.textContent = "Light";
      } else {
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
        buttonText.textContent = "Dark";
      }
    }

    // Load saved preference from localStorage or detect system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      root.classList.add(savedTheme + "-mode");
      updateThemeUI(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      updateThemeUI(prefersDark ? "dark" : "light");
    }

    themeToggleBtn.addEventListener("click", () => {
      // Determine current theme
      const currentTheme = localStorage.getItem("theme");
      const isDark =
        currentTheme === "dark" ||
        (!currentTheme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      // Toggle to opposite theme
      const newTheme = isDark ? "light" : "dark";

      // Remove both classes first
      root.classList.remove("light-mode", "dark-mode");
      root.classList.add(newTheme + "-mode");
      updateThemeUI(newTheme);

      // Save preference to localStorage
      localStorage.setItem("theme", newTheme);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
