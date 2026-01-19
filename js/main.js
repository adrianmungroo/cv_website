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

  /**
   * Initialize the application
   */
  function init() {
    updateYear();
    initTabs();
    initTagFilter();
    initWidthToggle();
    initThemeToggle();
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

      filterItem.appendChild(checkbox);
      filterItem.appendChild(label);
      filterItem.appendChild(count);

      tagList.appendChild(filterItem);
    });
  }

  /**
   * Handle tag checkbox toggle
   */
  function handleTagToggle(e) {
    const tagText = e.target.value;

    if (e.target.checked) {
      selectedTags.add(tagText);
    } else {
      selectedTags.delete(tagText);
    }

    applyFilters();
  }

  /**
   * Apply filters to show/hide items
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

    items.forEach((item) => {
      const itemTags = Array.from(item.querySelectorAll(".tag")).map((tag) =>
        tag.textContent.trim()
      );

      // If item has no tags, always show it
      if (itemTags.length === 0) {
        item.classList.remove("filtered-out");
        return;
      }

      // Check if item has any of the selected tags
      const hasSelectedTag = itemTags.some((tag) => selectedTags.has(tag));

      if (hasSelectedTag) {
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
    const checkboxes = tagList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
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
