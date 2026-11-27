/* ==========================================================================
   硅序漫谈 — structured lesson navigation and formative practice
   ========================================================================== */
(function () {
  "use strict";

  const lessons = Array.from(document.querySelectorAll("[data-lesson]"));
  if (!lessons.length) return;

  const links = Array.from(document.querySelectorAll(".lesson-nav-link[data-lesson-link]"));
  const allLinks = Array.from(document.querySelectorAll("[data-lesson-link]"));
  const selects = Array.from(document.querySelectorAll("[data-lesson-select]"));
  const total = lessons.length;
  const progressKey = "zhixu.learn.progress.v1";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const learnMain = document.querySelector(".learn-main");
  const liveRegion = document.querySelector("[data-lesson-live]");
  const markButton = document.querySelector("[data-mark-current]");
  const resumeLink = document.querySelector("[data-resume-link]");
  const resumeLabel = document.querySelector("[data-resume-label]");
  const prevControls = Array.from(document.querySelectorAll("[data-lesson-prev], [data-pager-prev]"));
  const nextControls = Array.from(document.querySelectorAll("[data-lesson-next], [data-pager-next]"));
  const pagerPrevTitle = document.querySelector("[data-pager-prev-title]");
  const pagerNextTitle = document.querySelector("[data-pager-next-title]");
  let currentIndex = 0;
  let completed = new Set();

  const lessonKeys = lessons.map((lesson) => lesson.dataset.lesson);

  function safeLoadProgress() {
    try {
      const raw = window.localStorage.getItem(progressKey);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((key) => lessonKeys.includes(key)));
    } catch (error) {
      return new Set();
    }
  }

  function safeSaveProgress() {
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(Array.from(completed)));
    } catch (error) {
      // In-memory progress still works when storage is unavailable.
    }
  }

  function updateProgressUI() {
    const count = completed.size;
    const percent = total ? Math.round((count / total) * 100) : 0;
    document.querySelectorAll("[data-course-percent]").forEach((node) => {
      node.textContent = String(percent);
    });
    document.querySelectorAll("[data-course-completed]").forEach((node) => {
      node.textContent = String(count);
    });
    document.querySelectorAll("[data-course-progress]").forEach((node) => {
      node.style.width = percent + "%";
    });
    links.forEach((link) => {
      link.classList.toggle("is-complete", completed.has(link.dataset.lessonLink));
    });

    if (resumeLink) {
      const firstIncomplete = lessons.findIndex((lesson) => !completed.has(lesson.dataset.lesson));
      const target = lessons[firstIncomplete === -1 ? 0 : firstIncomplete];
      resumeLink.dataset.lessonLink = target.dataset.lesson;
      resumeLink.setAttribute("href", "#" + target.dataset.lesson);
      if (resumeLabel) {
        if (firstIncomplete === -1) resumeLabel.textContent = "全部完成 · 从第一讲复习";
        else resumeLabel.textContent = `继续第 ${firstIncomplete + 1} 讲`;
      }
    }

    if (markButton) {
      const isComplete = completed.has(lessons[currentIndex].dataset.lesson);
      markButton.disabled = isComplete;
      markButton.textContent = isComplete ? "本讲已完成" : "标记本讲完成";
    }
  }

  function markComplete(key) {
    if (!key || completed.has(key)) return;
    completed.add(key);
    safeSaveProgress();
    updateProgressUI();
    if (liveRegion) {
      liveRegion.textContent = "已记录完成，目前完成 " + completed.size + " / " + total + " 讲。";
    }
  }

  function scrollToCourseTop() {
    if (!learnMain) return;
    const top = learnMain.getBoundingClientRect().top + window.scrollY - ((header?.offsetHeight || 72) + 24);
    if (typeof window.zhixuScrollTo === "function") {
      window.zhixuScrollTo(top);
    } else {
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    }
  }

  function setHash(key) {
    if (window.location.hash === "#" + key) return;
    if (history.pushState) history.pushState(null, "", "#" + key);
    else window.location.hash = "#" + key;
  }

  function updateCurrentUI() {
    const lesson = lessons[currentIndex];
    const key = lesson.dataset.lesson;
    const title = lesson.querySelector("h2")?.textContent?.trim() || "";

    links.forEach((link) => {
      const active = link.dataset.lessonLink === key;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    selects.forEach((select) => {
      select.value = key;
    });

    document.querySelectorAll("[data-lesson-position]").forEach((node) => {
      node.textContent = `第 ${String(currentIndex + 1).padStart(2, "0")} 讲 / 共 ${String(total).padStart(2, "0")} 讲`;
    });

    const prevLesson = lessons[currentIndex - 1];
    const nextLesson = lessons[currentIndex + 1];
    prevControls.forEach((button) => {
      button.disabled = !prevLesson;
      if (!prevLesson) button.setAttribute("aria-disabled", "true");
      else button.removeAttribute("aria-disabled");
    });
    nextControls.forEach((button) => {
      button.disabled = !nextLesson;
      if (!nextLesson) button.setAttribute("aria-disabled", "true");
      else button.removeAttribute("aria-disabled");
    });

    if (pagerPrevTitle) pagerPrevTitle.textContent = prevLesson ? prevLesson.querySelector("h2").textContent.trim() : "已经是第一讲";
    if (pagerNextTitle) pagerNextTitle.textContent = nextLesson ? nextLesson.querySelector("h2").textContent.trim() : "已经完成全部课程";

    updateProgressUI();

    const activeLink = links.find((link) => link.dataset.lessonLink === key);
    if (activeLink && window.innerWidth > 1024) {
      activeLink.scrollIntoView({ block: "nearest" });
    }

    document.title = title + " · 硅序漫谈｜了解AI";
  }

  function showLesson(index, options = {}) {
    if (!lessons[index]) return;
    const { scroll = false, updateUrl = false, focus = false } = options;
    currentIndex = index;
    const lesson = lessons[currentIndex];

    lessons.forEach((item, itemIndex) => {
      item.hidden = itemIndex !== currentIndex;
    });
    updateCurrentUI();

    if (updateUrl) setHash(lesson.dataset.lesson);
    if (liveRegion) {
      liveRegion.textContent = `已切换到第 ${currentIndex + 1} 讲：${lesson.querySelector("h2").textContent.trim()}`;
    }

    if (focus) {
      const heading = lesson.querySelector("h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }

    if (scroll) {
      scrollToCourseTop();
    }
  }

  function currentKeyFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return null;
    return lessonKeys.includes(hash) ? hash : null;
  }

  // Navigation
  allLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const key = link.dataset.lessonLink;
      const index = lessonKeys.indexOf(key);
      if (index >= 0) showLesson(index, { scroll: true, updateUrl: true, focus: true });
    });
  });

  selects.forEach((select) => {
    select.addEventListener("change", () => {
      const index = lessonKeys.indexOf(select.value);
      if (index >= 0) showLesson(index, { scroll: true, updateUrl: true, focus: true });
    });
  });

  prevControls.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentIndex > 0) showLesson(currentIndex - 1, { scroll: true, updateUrl: true, focus: true });
    });
  });

  nextControls.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentIndex < total - 1) showLesson(currentIndex + 1, { scroll: true, updateUrl: true, focus: true });
    });
  });

  markButton?.addEventListener("click", () => {
    markComplete(lessons[currentIndex].dataset.lesson);
  });

  window.addEventListener("hashchange", () => {
    const key = currentKeyFromHash();
    if (!key) return;
    const index = lessonKeys.indexOf(key);
    if (index >= 0 && index !== currentIndex) {
      showLesson(index, { scroll: true, updateUrl: false, focus: false });
    }
  });

  window.addEventListener("popstate", () => {
    const key = currentKeyFromHash();
    if (!key) return;
    const index = lessonKeys.indexOf(key);
    if (index >= 0 && index !== currentIndex) {
      showLesson(index, { scroll: true, updateUrl: false, focus: false });
    }
  });

  // Practice: immediate feedback and local progress.
  document.querySelectorAll("[data-practice]").forEach((practice) => {
    const lesson = practice.closest("[data-lesson]");
    const explanation = practice.querySelector("[data-practice-explanation]");
    const feedback = practice.querySelector("[data-practice-feedback]");
    const options = Array.from(practice.querySelectorAll(".practice-option"));
    const correct = practice.dataset.correct;
    const lessonKey = lesson?.dataset.lesson;
    let answeredCorrectly = false;

    options.forEach((option) => {
      option.addEventListener("click", () => {
        if (answeredCorrectly) return;
        const choice = option.dataset.option;
        const isCorrect = choice === correct;

        options.forEach((item) => {
          item.classList.remove("is-correct", "is-wrong");
          item.setAttribute("aria-pressed", "false");
        });
        option.classList.add(isCorrect ? "is-correct" : "is-wrong");
        option.setAttribute("aria-pressed", "true");
        options
          .filter((item) => item.dataset.option === correct)
          .forEach((item) => item.classList.add("is-correct"));

        if (feedback && explanation) {
          const answerHTML = explanation.innerHTML;
          feedback.hidden = false;
          feedback.className = "practice-feedback " + (isCorrect ? "is-correct" : "is-wrong");
          feedback.innerHTML = isCorrect
            ? `<strong>回答正确。</strong>${answerHTML}`
            : `<strong>这个选项还不准确。</strong>${answerHTML}<p>可以再看一遍上面的讲解，然后选择正确选项。</p>`;
        }

        if (isCorrect) {
          answeredCorrectly = true;
          options.forEach((item) => {
            item.disabled = true;
          });
          markComplete(lessonKey);
        }
      });
    });
  });

  // Initial view and progress.
  completed = safeLoadProgress();
  const initialKey = currentKeyFromHash();
  const initialIndex = initialKey ? lessonKeys.indexOf(initialKey) : 0;
  showLesson(initialIndex >= 0 ? initialIndex : 0, { scroll: false, updateUrl: false, focus: false });

  if (initialKey) {
    window.setTimeout(() => {
      scrollToCourseTop();
    }, 80);
  }
})();
