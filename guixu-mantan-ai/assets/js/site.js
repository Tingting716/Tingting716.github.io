/* ==========================================================================
   硅序漫谈 — shared interactions
   Lightweight, dependency-free, progressively enhanced.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const body = document.body;
  const page = body.dataset.page || "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = $(".site-header");
  const scrollTopButton = $(".back-to-top");
  const menuToggle = $(".menu-toggle");
  const mobileMenu = $("#mobileMenu");
  const mobileBackdrop = $(".mobile-backdrop");
  const worksTrigger = $("#worksTrigger");
  const worksMega = $("#worksMega");
  const searchOverlay = $("#searchOverlay");
  const searchInput = $("#searchInput");
  const searchResults = $("#searchResults");
  const searchSummary = $("#searchSummary");
  const searchFilters = $("#searchFilters");

  let searchOpen = false;
  let menuOpen = false;
  let lastFocused = null;
  let searchActiveIndex = -1;
  let searchMatches = [];
  let activeSearchFilter = "all";
  let ticking = false;

  /* ----------------------------------------------------------------------
     Content index — the small, intentionally curated search corpus
     ---------------------------------------------------------------------- */
  const SEARCH_INDEX = [
    {
      type: "知识",
      title: "人工智能的定义与分类",
      desc: "从概念边界到弱人工智能、通用人工智能，建立讨论的共同语言。",
      url: "learn.html#p1-ai-definition",
      keywords: "人工智能 定义 分类 弱人工智能 通用人工智能 强人工智能 概念",
      featured: true,
    },
    {
      type: "知识",
      title: "人工智能发展历程",
      desc: "从达特茅斯会议、专家系统到深度学习，理解技术周期的起伏。",
      url: "learn.html#p2-ai-history",
      keywords: "历史 发展 达特茅斯 图灵 专家系统 寒冬 深度学习",
      featured: true,
    },
    {
      type: "知识",
      title: "机器学习的基本范式",
      desc: "监督学习、无监督学习、自监督学习与强化学习的区别与联系。",
      url: "learn.html#p4-machine-learning",
      keywords: "机器学习 监督学习 无监督学习 自监督 强化学习 数据 模型",
    },
    {
      type: "知识",
      title: "神经网络与深度学习",
      desc: "从感知机到多层网络，理解表示学习与反向传播的核心思想。",
      url: "learn.html#p5-deep-learning",
      keywords: "神经网络 深度学习 感知机 反向传播 表示学习 CNN Transformer",
    },
    {
      type: "知识",
      title: "自然语言处理",
      desc: "机器如何理解、生成和分析人类语言，以及它仍然不擅长什么。",
      url: "learn.html#p6-nlp",
      keywords: "自然语言处理 NLP 语言 理解 生成 词向量 注意力",
    },
    {
      type: "知识",
      title: "大模型的工作原理",
      desc: "从 token、注意力到下一词预测，拆解大语言模型的能力与局限。",
      url: "learn.html#p7-large-models",
      keywords: "大模型 大语言模型 LLM Transformer token 注意力 预训练 幻觉",
      featured: true,
    },
    {
      type: "知识",
      title: "AI 伦理与法律",
      desc: "公平、透明、隐私与责任：算法进入真实世界后的制度问题。",
      url: "learn.html#p3-ai-ethics",
      keywords: "伦理 法律 公平 透明 隐私 责任 算法偏见",
    },
    {
      type: "知识",
      title: "人工智能的社会影响",
      desc: "就业结构、教育公平、权力集中与环境成本，超越单一效率叙事。",
      url: "article-ai-society.html",
      keywords: "社会影响 就业 劳动 教育 公平 隐私 环境 权力",
      featured: true,
    },
    {
      type: "知识",
      title: "AI 与司法实践",
      desc: "类案检索、电子卷宗与裁判辅助，如何守住程序正义的边界。",
      url: "learn.html#p12-justice",
      keywords: "司法 法院 法官 裁判 类案检索 人机协同 程序正义 算法",
      featured: true,
    },
    {
      type: "知识",
      title: "生成式 AI 与信息生态",
      desc: "内容成本下降后，信息生产、分发、消费与验证链条如何改变。",
      url: "learn.html#p13-information",
      keywords: "生成式人工智能 AIGC 信息生态 深度伪造 幻觉 内容 新闻 核查",
      featured: true,
    },
    {
      type: "知识",
      title: "深度伪造与信息核查",
      desc: "识别合成内容不是“看一眼”，而是一套可重复的验证流程。",
      url: "article-information-ecology.html#verification",
      keywords: "深度伪造 识别 核查 溯源 图片 视频 合成内容 标注",
    },
    {
      type: "知识",
      title: "全球人工智能治理",
      desc: "欧盟、中国、美国与国际组织的不同路径，以及共同难题。",
      url: "learn.html#p14-governance",
      keywords: "全球治理 欧盟 AI Act 中国 美国 联合国 UNESCO OECD 监管",
      featured: true,
    },
    {
      type: "知识",
      title: "中国 AI 治理与敏捷监管",
      desc: "算法推荐、深度合成、生成式服务与内容标识的制度演进。",
      url: "article-ai-governance.html#approaches",
      keywords: "中国 算法 深度合成 生成式人工智能 标识 治理 监管",
    },
    {
      type: "知识",
      title: "AI 时代的核心素养",
      desc: "会使用工具只是起点，更重要的是判断、验证与负责任地行动。",
      url: "learn.html#p15-literacy",
      keywords: "AI素养 人才 教育 提示词 判断力 责任 学习",
    },
    {
      type: "知识",
      title: "任务拆解与提示设计",
      desc: "把目标、上下文、约束与输出格式说清楚，并逐步核验。",
      url: "learn.html#p8-prompting",
      keywords: "提示词 prompt 任务拆解 上下文 约束 输出格式 协作",
    },
    {
      type: "知识",
      title: "AI 赋能学习与办公",
      desc: "让 AI 辅助摘要、提纲与格式，同时保留核验、隐私与责任。",
      url: "learn.html#p9-study-office",
      keywords: "学习 办公 效率 摘要 笔记 隐私 学术诚信 过程证据",
    },
    {
      type: "知识",
      title: "AI 多媒体创作与真实性",
      desc: "理解图像、音频与视频生成中的版权、人格、知情与标识。",
      url: "learn.html#p10-media",
      keywords: "多媒体 图像 视频 音频 版权 肖像 标识 合成内容 创作",
    },
    {
      type: "知识",
      title: "智能体与人类确认",
      desc: "从回答问题到采取行动：工具调用、权限、日志与人工确认。",
      url: "learn.html#p11-agents",
      keywords: "智能体 agent 工具调用 权限 沙箱 人工确认 自动化",
    },
    {
      type: "文章",
      title: "生成式 AI 与信息生态：当内容开始自我繁殖",
      desc: "从内容生产链到认知治理，理解 AI 时代最稀缺的资源——判断力。",
      url: "article-information-ecology.html",
      keywords: "文章 信息生态 生成式 AI 内容 深度伪造 幻觉 判断力",
      featured: true,
    },
    {
      type: "文章",
      title: "人工智能七十年：从符号到生成",
      desc: "一条并不笔直的技术路径，以及它留给今天的三个提醒。",
      url: "article-ai-history.html",
      keywords: "文章 历史 七十年 符号主义 连接主义 大模型",
    },
    {
      type: "文章",
      title: "效率红利之外，AI 的社会成本由谁承担？",
      desc: "劳动、教育、偏见与环境：把“谁受益、谁承担”放回技术讨论。",
      url: "article-ai-society.html",
      keywords: "文章 社会 劳动 教育 偏见 环境 效率 成本",
    },
    {
      type: "文章",
      title: "全球 AI 治理：从原则共识到规则落地",
      desc: "比较欧盟、中国、美国与国际组织的治理路径与关键分歧。",
      url: "article-ai-governance.html",
      keywords: "文章 治理 规则 欧盟 中国 美国 联合国",
    },
    {
      type: "文章",
      title: "学术论文专栏",
      desc: "从 Transformer 到随机鹦鹉，五篇进入 AI 讨论的必读论文。",
      url: "articles.html#papers",
      keywords: "论文 学术 阅读 Transformer 随机鹦鹉 基础模型 可解释性",
    },
    {
      type: "项目",
      title: "AI 与司法实践",
      desc: "一个关于人机协同、可解释性与程序正义的研究型项目。",
      url: "project-justice.html",
      keywords: "项目 司法 法院 裁判 人机协同 算法 法律",
      featured: true,
    },
    {
      type: "项目",
      title: "生成式 AI 与信息生态",
      desc: "追踪合成内容的生产、分发与验证，设计面向学习者的核查流程。",
      url: "project-ecology.html",
      keywords: "项目 信息生态 生成式 AI 核查 深伪 内容",
    },
    {
      type: "项目",
      title: "AI 通识学习路径",
      desc: "把教材 10 章转译为 3 个阶段、可执行的学习与实践任务。",
      url: "project-learning.html",
      keywords: "项目 学习路径 教材 课程 学习 AI通识",
    },
    {
      type: "项目",
      title: "信息核查实验室",
      desc: "三道题，练习证据意识、横向检索与来源核验。",
      url: "experiment-verify.html",
      keywords: "项目 实验 信息核查 深伪 来源 验证",
    },
    {
      type: "工具",
      title: "学习自测与参考答案",
      desc: "12 道覆盖基础、技术与治理的题目，附解析与教师答案速览。",
      url: "answers.html",
      keywords: "自测 答案 测验 题库 解析 教师",
      featured: true,
    },
    {
      type: "工具",
      title: "教材使用指南",
      desc: "如何用《人工智能通识及应用》组织课堂、自学与项目实践。",
      url: "about.html#path",
      keywords: "教材 使用 指南 课堂 教师 学生 学习",
    },
    {
      type: "论文",
      title: "Attention Is All You Need",
      desc: "Vaswani 等，2017。Transformer 架构的起点。",
      url: "articles.html#papers",
      keywords: "Attention Transformer 注意力 论文 Vaswani",
    },
    {
      type: "论文",
      title: "On the Dangers of Stochastic Parrots",
      desc: "Bender 等，2021。大语言模型的风险、偏见与规模叙事。",
      url: "articles.html#papers",
      keywords: "Stochastic Parrots 随机鹦鹉 风险 偏见 论文",
    },
    {
      type: "论文",
      title: "On the Opportunities and Risks of Foundation Models",
      desc: "Bommasani 等，2021。基础模型的机遇、风险与研究议程。",
      url: "articles.html#papers",
      keywords: "Foundation Models 基础模型 机遇 风险 论文",
    },
    {
      type: "论文",
      title: "AI4People—An Ethical Framework for a Good AI Society",
      desc: "Floridi 等，2018。以人为中心的 AI 伦理框架。",
      url: "articles.html#papers",
      keywords: "AI4People 伦理 框架 论文 Floridi",
    },
  ];

  /* ----------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */
  function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target.isContentEditable
    );
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function lockScroll() {
    body.classList.add("is-locked");
  }

  function unlockScroll() {
    if (!searchOpen && !menuOpen) {
      body.classList.remove("is-locked");
    }
  }

  let activeScrollAnimation = null;
  let scrollFallbackTimer = null;
  let pendingHashTimer = null;

  function animateScrollTo(targetTop) {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const destination = Math.min(maxScroll, Math.max(0, targetTop));
    const start = window.scrollY;

    if (activeScrollAnimation) cancelAnimationFrame(activeScrollAnimation);
    if (scrollFallbackTimer) window.clearTimeout(scrollFallbackTimer);

    if (reduceMotion || Math.abs(destination - start) < 2) {
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, destination);
      root.style.scrollBehavior = previousBehavior;
      activeScrollAnimation = null;
      scrollFallbackTimer = null;
      return;
    }

    root.style.scrollBehavior = "auto";
    const distance = Math.abs(destination - start);
    const duration = Math.min(620, Math.max(280, distance * 0.3));
    const started = performance.now();
    let finished = false;

    function finish(immediate) {
      if (finished) return;
      finished = true;
      if (immediate) window.scrollTo(0, destination);
      if (activeScrollAnimation) cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
      if (scrollFallbackTimer) window.clearTimeout(scrollFallbackTimer);
      scrollFallbackTimer = null;
      root.style.scrollBehavior = previousBehavior;
      if (typeof onScrollFrame === "function") onScrollFrame();
    }

    function step(now) {
      if (finished) return;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start + (destination - start) * eased);
      if (progress < 1) {
        activeScrollAnimation = requestAnimationFrame(step);
      } else {
        finish(false);
      }
    }

    scrollFallbackTimer = window.setTimeout(() => {
      if (Math.abs(window.scrollY - destination) > 4) finish(true);
      else finish(false);
    }, duration + 180);

    activeScrollAnimation = requestAnimationFrame(step);
  }

  function scrollToHash(hash) {
    if (!hash || hash === "#") return false;
    const id = hash.replace(/^#/, "");
    const target = document.getElementById(id);
    if (!target) return false;

    let openedDetails = false;
    if (target.tagName === "DETAILS" && !target.open) {
      target.open = true;
      openedDetails = true;
    }
    const closedParent = target.closest ? target.closest("details") : null;
    if (closedParent && !closedParent.open) {
      closedParent.open = true;
      openedDetails = true;
    }

    if (pendingHashTimer) {
      window.clearTimeout(pendingHashTimer);
      pendingHashTimer = null;
    }

    const performScroll = () => {
      pendingHashTimer = null;
      const offset = (header ? header.offsetHeight : 0) + 24;
      const top =
        id === "top"
          ? 0
          : target.getBoundingClientRect().top + window.scrollY - offset;
      animateScrollTo(top);
      if (id !== "top") {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };

    // Opening a details element can also collapse a sibling in the accordion.
    // Wait one layout turn so the anchor offset is based on final geometry.
    if (openedDetails) {
      pendingHashTimer = window.setTimeout(performScroll, 40);
    } else {
      performScroll();
    }

    if (history.pushState && location.hash !== "#" + id) {
      history.pushState(null, "", "#" + id);
    }
    return true;
  }

  window.addEventListener("hashchange", () => {
    if (location.hash) scrollToHash(location.hash);
  });

  window.zhixuScrollTo = animateScrollTo;

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const link = event.target.closest('a[href*="#"]');
    if (!link) return;
    let url;
    try {
      url = new URL(link.getAttribute("href"), window.location.href);
    } catch (error) {
      return;
    }
    if (url.pathname !== window.location.pathname || !url.hash) return;
    const target = document.getElementById(url.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    scrollToHash(url.hash);
  });

  function getFocusable(container) {
    if (!container) return [];
    return $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      container
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function trapFocus(event, container) {
    if (event.key !== "Tab" || !container) return;
    const focusable = getFocusable(container);
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

  let toastTimer;
  function showToast(message) {
    let toast = $(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.innerHTML =
        '<svg class="icon" aria-hidden="true"><use href="#i-check-circle"></use></svg><span></span>';
      document.body.appendChild(toast);
    }
    const label = toast.querySelector("span");
    if (label) label.textContent = message;
    toast.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-show"), 3200);
  }

  function closeWorksMega(restoreFocus) {
    if (!worksMega || !worksTrigger) return;
    if (!worksMega.classList.contains("is-open")) return;
    worksMega.classList.remove("is-open");
    worksMega.setAttribute("aria-hidden", "true");
    worksTrigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) worksTrigger.focus();
  }

  function openWorksMega() {
    if (!worksMega || !worksTrigger) return;
    closeMobileMenu(false);
    worksMega.classList.add("is-open");
    worksMega.setAttribute("aria-hidden", "false");
    worksTrigger.setAttribute("aria-expanded", "true");
  }

  function toggleWorksMega() {
    if (!worksMega) return;
    if (worksMega.classList.contains("is-open")) closeWorksMega(false);
    else openWorksMega();
  }

  /* ----------------------------------------------------------------------
     Header, scroll state, reading progress, back to top
     ---------------------------------------------------------------------- */
  const isArticlePage = !!$(".article-content");
  const homeSections = page === "home" ? $$("[data-spy]") : [];
  const navLinks = $$(".nav-link[data-nav]");

  function updateNavState() {
    if (page !== "home" || !homeSections.length) return;
    const y = window.scrollY;
    let active = "home";

    homeSections.forEach((section) => {
      const top = section.getBoundingClientRect().top;
      if (top <= 150) active = section.dataset.spy;
    });

    // The final section may not be able to reach the probe line on tall screens.
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) {
      active = homeSections[homeSections.length - 1].dataset.spy;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("is-current", link.dataset.nav === active);
    });
    $$(".mobile-nav [data-nav]").forEach((link) => {
      link.classList.toggle("is-current", link.dataset.nav === active);
    });
  }

  function updateReadingProgress() {
    const progress = $(".reading-progress");
    if (!progress || !isArticlePage) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progress.style.width = percentage + "%";
  }

  function updateTOC() {
    if (!isArticlePage) return;
    const headings = $$(".article-content h2[id], .article-content h3[id]");
    if (!headings.length) return;
    const tocLinks = $$(".article-toc a, .article-toc-mobile a");
    let activeId = headings[0].id;
    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top <= (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || 72) + 52) {
        activeId = heading.id;
      }
    });
    tocLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + activeId);
    });
  }

  function onScrollFrame() {
    ticking = false;
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    if (scrollTopButton) {
      const visible = y > 800;
      scrollTopButton.classList.toggle("is-visible", visible);
      body.classList.toggle("has-back-to-top", visible);
    }
    updateNavState();
    updateReadingProgress();
    updateTOC();
  }

  function requestScrollUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScrollFrame);
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeMobileMenu(false);
    requestScrollUpdate();
  }, { passive: true });

  if (scrollTopButton) {
    scrollTopButton.addEventListener("click", () => {
      animateScrollTo(0);
    });
  }

  /* ----------------------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------------------- */
  function openMobileMenu() {
    if (!mobileMenu || !menuToggle) return;
    closeWorksMega(false);
    closeSearch(false);
    menuOpen = true;
    lastFocused = document.activeElement;
    body.classList.add("menu-open");
    lockScroll();
    menuToggle.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    if (mobileBackdrop) mobileBackdrop.setAttribute("aria-hidden", "false");
    const closeButton = $(".menu-close", mobileMenu);
    if (closeButton) window.setTimeout(() => closeButton.focus(), 80);
  }

  function closeMobileMenu(restoreFocus = true) {
    if (!mobileMenu || !menuOpen) return;
    menuOpen = false;
    body.classList.remove("menu-open");
    unlockScroll();
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (mobileBackdrop) mobileBackdrop.setAttribute("aria-hidden", "true");
    if (restoreFocus) {
      const focusTarget = lastFocused && lastFocused.focus ? lastFocused : menuToggle;
      focusTarget.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (menuOpen) closeMobileMenu();
      else openMobileMenu();
    });
  }

  if (mobileMenu) {
    $(".menu-close", mobileMenu)?.addEventListener("click", () => closeMobileMenu());
    $$("a", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => closeMobileMenu(false));
    });
    mobileMenu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      } else {
        trapFocus(event, mobileMenu);
      }
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", () => closeMobileMenu());
  }

  /* ----------------------------------------------------------------------
     Works mega menu
     ---------------------------------------------------------------------- */
  if (worksTrigger) {
    worksTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleWorksMega();
    });
  }

  if (worksMega) {
    $$("a", worksMega).forEach((link) => {
      link.addEventListener("click", () => closeWorksMega(false));
    });
    worksMega.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeWorksMega(true);
    });
  }

  document.addEventListener("click", (event) => {
    if (worksMega?.classList.contains("is-open")) {
      if (!event.target.closest(".nav-item--works") && !event.target.closest("#worksMega")) {
        closeWorksMega(false);
      }
    }
  });

  /* ----------------------------------------------------------------------
     Search overlay
     ---------------------------------------------------------------------- */
  function getSearchFilters() {
    return ["全部", "知识", "文章", "项目", "工具", "论文"];
  }

  function renderSearchFilters() {
    if (!searchFilters) return;
    searchFilters.innerHTML = getSearchFilters()
      .map((label) => {
        const value = label === "全部" ? "all" : label;
        const active = value === activeSearchFilter;
        return `<button class="search-filter${active ? " is-active" : ""}" type="button" role="tab" aria-selected="${active}" data-search-filter="${escapeHTML(value)}">${escapeHTML(label)}</button>`;
      })
      .join("");
  }

  function markQuery(text, query) {
    const safe = escapeHTML(text);
    const q = query.trim();
    if (!q) return safe;
    const terms = q.split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (!terms.length) return safe;
    return safe.replace(new RegExp("(" + terms.join("|") + ")", "gi"), "<mark>$1</mark>");
  }

  function searchCorpus(query) {
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    let items = SEARCH_INDEX.filter((item) => {
      if (activeSearchFilter !== "all" && item.type !== activeSearchFilter) return false;
      if (!terms.length) return true;
      const haystack = (item.title + " " + item.desc + " " + item.keywords).toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });

    if (!terms.length) {
      items = items.sort((a, b) => Number(b.featured || 0) - Number(a.featured || 0));
    } else {
      items = items
        .map((item) => {
          const title = item.title.toLowerCase();
          let score = 0;
          terms.forEach((term) => {
            if (title.includes(term)) score += 12;
            if (item.keywords.toLowerCase().includes(term)) score += 5;
            if (item.desc.toLowerCase().includes(term)) score += 2;
          });
          return { item, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);
    }

    return items;
  }

  function renderSearchResults(query = "") {
    if (!searchResults) return;
    searchMatches = searchCorpus(query);
    const noQuery = !query.trim();
    const visible = noQuery || !searchMatches.length ? searchMatches.slice(0, noQuery ? 7 : 20) : searchMatches;
    searchActiveIndex = visible.length ? 0 : -1;

    if (!visible.length) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>
          <p><strong>没有找到“${escapeHTML(query.trim())}”</strong>试试更短的关键词，例如“司法”“大模型”或“治理”。</p>
        </div>`;
    } else {
      searchResults.innerHTML = visible
        .map((item, index) => {
          return `<a class="search-result${index === 0 ? " is-active" : ""}" href="${escapeHTML(item.url)}" data-search-result="${index}">
            <span class="search-result-top"><span class="search-result-type">${escapeHTML(item.type)}</span></span>
            <span class="search-result-title">${markQuery(item.title, query)}</span>
            <span class="search-result-desc">${markQuery(item.desc, query)}</span>
          </a>`;
        })
        .join("");
    }

    if (searchSummary) {
      if (!query.trim()) {
        searchSummary.textContent = `推荐 ${visible.length} 条 · 共 ${SEARCH_INDEX.length} 条知识索引`;
      } else {
        searchSummary.textContent = searchMatches.length ? `找到 ${searchMatches.length} 条相关结果` : "没有匹配结果";
      }
    }

    updateSearchActive();
  }

  function updateSearchActive() {
    if (!searchResults) return;
    $$(".search-result", searchResults).forEach((result, index) => {
      result.classList.toggle("is-active", index === searchActiveIndex);
      if (index === searchActiveIndex) {
        result.setAttribute("aria-current", "true");
      } else {
        result.removeAttribute("aria-current");
      }
    });
  }

  function moveSearchSelection(direction) {
    const items = $$(".search-result", searchResults);
    if (!items.length) return;
    searchActiveIndex = (searchActiveIndex + direction + items.length) % items.length;
    updateSearchActive();
    const active = items[searchActiveIndex];
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function openSearch(query, fromElement) {
    if (!searchOverlay || !searchInput) return;
    closeMobileMenu(false);
    closeWorksMega(false);
    lastFocused = fromElement || document.activeElement;
    searchOpen = true;
    body.classList.add("is-locked");
    searchOverlay.classList.add("is-open");
    searchOverlay.setAttribute("aria-hidden", "false");
    if (typeof query === "string") searchInput.value = query;
    activeSearchFilter = "all";
    renderSearchFilters();
    renderSearchResults(searchInput.value);
    window.setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 60);
  }

  function closeSearch(restoreFocus = true) {
    if (!searchOverlay || !searchOpen) return;
    searchOpen = false;
    searchOverlay.classList.remove("is-open");
    searchOverlay.setAttribute("aria-hidden", "true");
    unlockScroll();
    if (restoreFocus && lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  $$("[data-close-search]").forEach((button) => {
    button.addEventListener("click", () => closeSearch());
  });

  $$(".js-open-search").forEach((button) => {
    button.addEventListener("click", () => openSearch("", button));
  });

  $$(".js-search-suggest").forEach((button) => {
    button.addEventListener("click", () => openSearch(button.dataset.searchQuery || "", button));
  });

  $$(".js-home-search").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("input", form);
      openSearch(input ? input.value : "", form);
    });
  });

  if (searchOverlay) {
    searchOverlay.addEventListener("click", (event) => {
      if (event.target === searchOverlay) closeSearch();
    });

    searchOverlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      } else {
        trapFocus(event, searchOverlay);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderSearchResults(searchInput.value);
    });
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSearchSelection(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSearchSelection(-1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const result = $$(".search-result", searchResults)[searchActiveIndex];
        if (result) {
          const href = result.getAttribute("href");
          let resultUrl;
          try {
            resultUrl = new URL(href, window.location.href);
          } catch (error) {
            resultUrl = null;
          }
          if (resultUrl && resultUrl.pathname === window.location.pathname && resultUrl.hash) {
            closeSearch(false);
            if (!scrollToHash(resultUrl.hash)) window.location.hash = resultUrl.hash;
          } else {
            window.location.href = href;
          }
        }
      }
    });
  }

  if (searchFilters) {
    searchFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-search-filter]");
      if (!button) return;
      activeSearchFilter = button.dataset.searchFilter;
      renderSearchFilters();
      renderSearchResults(searchInput ? searchInput.value : "");
      const nextButton = $(
        `[data-search-filter="${activeSearchFilter}"]`,
        searchFilters
      );
      nextButton?.focus();
    });
  }

  $$(".js-search-submit").forEach((button) => {
    button.addEventListener("click", () => {
      openSearch(searchInput ? searchInput.value : "", button);
    });
  });

  if (searchResults) {
    searchResults.addEventListener("click", (event) => {
      const link = event.target.closest(".search-result");
      if (link) closeSearch(false);
    });
  }

  // Surface the actual index size in copy where requested.
  $$("[data-search-count]").forEach((node) => {
    node.textContent = String(SEARCH_INDEX.length);
  });

  // Global keyboard shortcuts.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (searchOpen) return; // handled by overlay
      if (menuOpen) closeMobileMenu();
      if (worksMega?.classList.contains("is-open")) closeWorksMega(true);
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (searchOpen) closeSearch();
      else openSearch("", document.activeElement);
      return;
    }

    if (event.key === "/" && !searchOpen && !menuOpen && !isTypingTarget(event.target)) {
      event.preventDefault();
      openSearch("", document.activeElement);
    }
  });

  /* ----------------------------------------------------------------------
     Works filter tabs
     ---------------------------------------------------------------------- */
  function getFilterFromURL() {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    return ["all", "web", "ai", "lab"].includes(filter) ? filter : "all";
  }

  $$("[data-works-tabs]").forEach((tablist) => {
    const gridId = tablist.dataset.target;
    const grid = gridId ? document.getElementById(gridId) : null;
    if (!grid) return;
    const tabs = $$(".tab", tablist);
    const cards = $$(".project-card", grid);
    const counter = document.querySelector(`[data-works-count="${gridId}"]`);
    const empty = document.querySelector(`[data-works-empty="${gridId}"]`);
    let selected = "all";

    function selectFilter(filter, updateUrl) {
      if (!["all", "web", "ai", "lab"].includes(filter)) filter = "all";
      selected = filter;
      tabs.forEach((tab) => {
        const active = tab.dataset.filter === filter;
        tab.setAttribute("aria-selected", String(active));
        tab.classList.toggle("is-active", active);
        tab.tabIndex = active ? 0 : -1;
        if (active) grid.setAttribute("aria-labelledby", tab.id);
      });
      let visibleCount = 0;
      cards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (counter) {
        counter.textContent = `共 ${visibleCount} 件作品`;
      }
      if (empty) empty.hidden = visibleCount !== 0;
      if (updateUrl && page === "works") {
        const next = new URL(window.location.href);
        if (filter === "all") next.searchParams.delete("filter");
        else next.searchParams.set("filter", filter);
        history.replaceState(null, "", next.pathname + next.search + next.hash);
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectFilter(tab.dataset.filter, true));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        const nextTab = tabs[nextIndex];
        selectFilter(nextTab.dataset.filter, true);
        nextTab.focus();
      });
    });

    const initial = page === "works" ? getFilterFromURL() : "all";
    selectFilter(initial, false);
  });

  /* ----------------------------------------------------------------------
     Article list search + filter
     ---------------------------------------------------------------------- */
  const articleFiltersRoot = $("[data-article-filters]");
  const articleSearch = $("[data-article-search]");
  if (articleFiltersRoot || articleSearch) {
    const cards = $$("[data-article-card]");
    const count = $("[data-article-count]");
    const empty = $("[data-articles-empty]");
    let category = "all";
    let query = "";

    function applyArticleFilters() {
      let visible = 0;
      cards.forEach((card) => {
        const categoryMatch = category === "all" || card.dataset.articleCategory === category;
        const text = (card.dataset.searchText || card.textContent || "").toLowerCase();
        const queryMatch = !query || text.includes(query.toLowerCase());
        const show = categoryMatch && queryMatch;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = `共 ${visible} 篇文章`;
      if (empty) empty.hidden = visible !== 0;
    }

    if (articleFiltersRoot) {
      const buttons = $$("[data-article-filter]", articleFiltersRoot);
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          category = button.dataset.articleFilter;
          buttons.forEach((item) => {
            const active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
          });
          applyArticleFilters();
        });
      });
    }

    if (articleSearch) {
      const wrapper = articleSearch.closest(".articles-search");
      const clearButton = $(".articles-search-clear", wrapper);
      const sync = () => {
        query = articleSearch.value.trim();
        wrapper?.classList.toggle("has-value", query.length > 0);
        applyArticleFilters();
      };
      articleSearch.addEventListener("input", sync);
      clearButton?.addEventListener("click", () => {
        articleSearch.value = "";
        sync();
        articleSearch.focus();
      });
    }

    applyArticleFilters();
  }

  /* ----------------------------------------------------------------------
     Accordions — keep one module open at a time
     ---------------------------------------------------------------------- */
  $$("[data-accordion]").forEach((group) => {
    const items = $$("details", group);
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */
  const revealItems = $$(".reveal");
  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  /* ----------------------------------------------------------------------
     Copy link / share
     ---------------------------------------------------------------------- */
  $$(".js-copy-link").forEach((button) => {
    button.addEventListener("click", async () => {
      const url = button.dataset.copyUrl || window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        showToast("链接已复制到剪贴板");
      } catch (error) {
        const helper = document.createElement("textarea");
        helper.value = url;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        try {
          document.execCommand("copy");
          showToast("链接已复制到剪贴板");
        } catch (copyError) {
          showToast("复制失败，请从地址栏复制链接");
        }
        helper.remove();
      }
    });
  });

  /* ----------------------------------------------------------------------
     Contact form (static demo, generates an email draft)
     ---------------------------------------------------------------------- */
  const contactForm = $("[data-contact-form]");
  if (contactForm) {
    const status = $("[data-form-status]", contactForm);
    const emailLink = $("[data-mailto-link]");
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        if (status) {
          status.textContent = "请补全标注为必填的字段。";
          status.className = "form-status is-error";
        }
        return;
      }
      const data = new FormData(contactForm);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const role = String(data.get("role") || "未填写身份");
      const subject = String(data.get("subject") || "站点交流");
      const message = String(data.get("message") || "").trim();
      const mailto = `mailto:hello@ai-literacy.cn?subject=${encodeURIComponent(
        "[硅序漫谈] " + subject
      )}&body=${encodeURIComponent(
        `姓名：${name}\n邮箱：${email}\n身份：${role}\n\n${message}`
      )}`;
      if (emailLink) {
        emailLink.href = mailto;
        emailLink.hidden = false;
      }
      if (status) {
        status.className = "form-status is-success";
        status.innerHTML = `校验通过。本站为静态学习项目，不会上传表单内容。<a class="link-underline" href="${mailto}">用邮件客户端发送</a>`;
      }
      showToast("表单校验通过，可继续通过邮件联系");
    });
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */
  window.addEventListener("load", () => {
    if (location.hash) {
      window.setTimeout(() => {
        const target = document.getElementById(location.hash.slice(1));
        if (target) scrollToHash(location.hash);
      }, 40);
    }
  });

  renderSearchFilters();
  renderSearchResults("");
  updateNavState();
  onScrollFrame();
})();
