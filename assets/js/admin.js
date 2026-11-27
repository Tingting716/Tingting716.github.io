/* ==========================================================================
   硅序漫谈 — content dashboard interactions
   ========================================================================== */
(function () {
  "use strict";

  const body = document.body;
  const sidebar = document.getElementById("adminSidebar");
  const backdrop = document.querySelector("[data-admin-backdrop]");
  const openButton = document.querySelector("[data-admin-menu-open]");
  const closeButton = document.querySelector("[data-admin-menu-close]");
  const breadcrumb = document.querySelector("[data-admin-breadcrumb]");
  const searchInput = document.getElementById("adminSearch");
  const searchField = document.querySelector(".admin-search");
  const submenuButton = document.querySelector("[data-admin-submenu]");
  const submenu = document.getElementById("adminArticlesSubnav");
  const toast = document.querySelector(".admin-toast");
  const toastText = document.querySelector("[data-admin-toast-text]");
  const viewTitles = {
    overview: "概览",
    projects: "项目",
    articles: "文章 / 文章列表",
    series: "文章 / 专栏管理",
    assets: "素材",
    settings: "设置",
  };
  const allowedViews = Object.keys(viewTitles);
  let currentView = "overview";
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message || "演示操作";
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-show"), 3200);
  }

  function openSubmenu() {
    if (!submenu || !submenuButton) return;
    submenu.hidden = false;
    submenuButton.classList.add("is-open");
    submenuButton.setAttribute("aria-expanded", "true");
  }

  function closeSubmenu() {
    if (!submenu || !submenuButton) return;
    submenu.hidden = true;
    submenuButton.classList.remove("is-open");
    submenuButton.setAttribute("aria-expanded", "false");
  }

  function setActiveNav(view) {
    document.querySelectorAll("[data-admin-link]").forEach((link) => {
      const active = link.dataset.view === view;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (submenuButton) {
      const isParentActive = view === "articles" || view === "series";
      submenuButton.classList.toggle("is-parent-active", isParentActive);
      if (isParentActive) {
        openSubmenu();
      }
    }
  }

  function showView(view, updateHash = true) {
    if (!allowedViews.includes(view)) view = "overview";
    currentView = view;
    document.querySelectorAll("[data-admin-view]").forEach((section) => {
      section.hidden = section.dataset.adminView !== view;
    });
    setActiveNav(view);
    if (breadcrumb) breadcrumb.textContent = viewTitles[view];
    document.title = `${viewTitles[view].replace(" / ", " · ")} · 硅序漫谈｜了解AI`;
    if (updateHash) {
      history.replaceState(null, "", `#${view}`);
    }
    applySearch();
    window.scrollTo({ top: 0, behavior: "auto" });
    closeAdminMenu(false);
  }

  function openAdminMenu() {
    body.classList.add("admin-menu-open", "is-locked");
    openButton?.setAttribute("aria-expanded", "true");
    if (backdrop) backdrop.setAttribute("aria-hidden", "false");
    window.setTimeout(() => closeButton?.focus(), 80);
  }

  function closeAdminMenu(restoreFocus = true) {
    body.classList.remove("admin-menu-open", "is-locked");
    openButton?.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.setAttribute("aria-hidden", "true");
    if (restoreFocus) openButton?.focus();
  }

  function isMobileNav() {
    return window.innerWidth <= 1024;
  }

  openButton?.addEventListener("click", openAdminMenu);
  closeButton?.addEventListener("click", () => closeAdminMenu());
  backdrop?.addEventListener("click", () => closeAdminMenu());

  document.querySelectorAll("[data-admin-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const view = link.dataset.view;
      if (view) showView(view);
    });
  });

  submenuButton?.addEventListener("click", () => {
    const isOpen = submenuButton.getAttribute("aria-expanded") === "true";
    if (isOpen) closeSubmenu();
    else openSubmenu();
  });

  const initialView = window.location.hash
    ? window.location.hash.replace("#", "")
    : "overview";
  showView(initialView, false);

  window.addEventListener("hashchange", () => {
    const view = window.location.hash.replace("#", "");
    if (view && view !== currentView) showView(view, false);
  });

  window.addEventListener("resize", () => {
    if (!isMobileNav()) closeAdminMenu(false);
    applySearch();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAdminMenu();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (searchField && getComputedStyle(searchField).display !== "none") {
        searchInput?.focus();
        searchInput?.select();
      } else {
        openAdminMenu();
      }
    }
    if (event.key === "Tab" && body.classList.contains("admin-menu-open") && isMobileNav()) {
      const focusable = Array.from(
        sidebar.querySelectorAll("a[href], button:not([disabled]), input:not([disabled])")
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  function getActiveView() {
    return document.querySelector(`[data-admin-view="${currentView}"]`);
  }

  function applySearch() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const view = getActiveView();
    if (!view) return;
    view.querySelectorAll("[data-search-row], [data-search-card]").forEach((item) => {
      const haystack = (item.dataset.searchText || item.textContent || "").toLowerCase();
      item.hidden = Boolean(query) && !haystack.includes(query);
    });
  }

  searchInput?.addEventListener("input", applySearch);

  // Toast triggers and static action demos.
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-admin-toast]");
    if (trigger) {
      if (trigger.hasAttribute("data-admin-toast") && trigger.classList.contains("admin-upload")) {
        event.preventDefault();
      }
      showToast(trigger.dataset.adminToast);
    }
  });

  document.querySelectorAll(".admin-upload").forEach((upload) => {
    upload.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showToast(upload.dataset.adminToast || "演示环境：上传功能未接入");
      }
    });
  });

  document.querySelectorAll("[data-admin-settings-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      showToast("设置已校验（演示环境，刷新后恢复默认）");
    });
  });

  // Toggle tasks in dashboard for a small sense of state.
  document.querySelectorAll(".admin-task input").forEach((input) => {
    input.addEventListener("change", () => {
      const remaining = document.querySelectorAll(".admin-task input:not(:checked)").length;
      const panelHead = input.closest(".admin-panel")?.querySelector(".admin-panel-head p");
      if (panelHead) {
        panelHead.textContent = remaining > 0 ? `${remaining} 项需要关注` : "全部完成";
      }
    });
  });

  // Keep submenu state in sync when closing a parent.
  if (submenuButton) {
    const initialOpen = !submenu?.hidden;
    submenuButton.setAttribute("aria-expanded", String(initialOpen));
  }
})();
