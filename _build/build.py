#!/usr/bin/env python3
"""Assemble the static AI Literacy companion site from shared chrome and page fragments."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = Path(__file__).resolve().parent / "pages"
SITE_NAME = "硅序漫谈｜了解AI"
SITE_TAGLINE = "大学生 AI 伴学课程"
SITE_EMAIL = "hello@ai-literacy.cn"
YEAR = "2026"

PAGES = {
    "index.html": {
        "page": "home",
        "title": "硅序漫谈｜了解AI · 从原理到实践，建立完整的 AI 通识",
        "description": "面向学生与教师的 AI 通识知识平台。以《人工智能通识及应用》为框架，连接发展历程、技术原理、社会影响、司法实践与全球治理。",
        "active": "home",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/data-700.webp",
    },
    "works.html": {
        "page": "works",
        "title": "作品与实践 · 硅序漫谈｜了解AI",
        "description": "在具体问题里练习 AI 素养：司法实践、信息生态、学习路径与信息核查实验室。",
        "active": "works",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/justice-700.webp",
    },
    "project-justice.html": {
        "page": "works",
        "title": "AI 与司法实践 · 硅序漫谈｜了解AI",
        "description": "从类案检索到裁判辅助，梳理人工智能进入司法场景后的机会、风险与人机协同边界。",
        "active": "works",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/justice-700.webp",
    },
    "project-ecology.html": {
        "page": "works",
        "title": "生成式 AI 与信息生态 · 硅序漫谈｜了解AI",
        "description": "追踪生成式 AI 如何改变内容生产、分发与验证，并设计面向学习者的信息核查路径。",
        "active": "works",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/newspaper-700.webp",
    },
    "project-learning.html": {
        "page": "works",
        "title": "AI 通识学习路径 · 硅序漫谈｜了解AI",
        "description": "把《人工智能通识及应用》的 10 章结构转译为三阶段、可执行的学习与实践路径。",
        "active": "works",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/classroom-700.webp",
    },
    "experiment-verify.html": {
        "page": "works",
        "title": "信息核查实验室 · 硅序漫谈｜了解AI",
        "description": "用三道贴近日常的信息判断练习，训练证据意识、横向检索与来源核验。",
        "active": "works",
        "scripts": ["assets/js/site.min.js", "assets/js/experiment.min.js"],
        "og_image": "assets/img/newspaper-700.webp",
    },
    "articles.html": {
        "page": "articles",
        "title": "文章与论文 · 硅序漫谈｜了解AI",
        "description": "关于 AI 历史、社会影响、信息生态与全球治理的深度文章，以及值得进入的学术论文。",
        "active": "articles",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/newspaper-700.webp",
    },
    "article-information-ecology.html": {
        "page": "articles",
        "title": "生成式 AI 与信息生态：当内容开始自我繁殖 · 硅序漫谈｜了解AI",
        "description": "从内容生产链到认知治理，理解生成式 AI 如何改变信息环境，以及个体如何保留判断力。",
        "active": "articles",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/newspaper-700.webp",
        "article": True,
    },
    "article-ai-history.html": {
        "page": "articles",
        "title": "人工智能七十年：从符号到生成 · 硅序漫谈｜了解AI",
        "description": "回望人工智能的七个发展阶段，理解技术周期、路径依赖与今天的生成式 AI。",
        "active": "articles",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/data-700.webp",
        "article": True,
    },
    "article-ai-society.html": {
        "page": "articles",
        "title": "效率红利之外，AI 的社会成本由谁承担？ · 硅序漫谈｜了解AI",
        "description": "从劳动、教育、偏见、隐私与环境五个维度，理解人工智能的社会影响。",
        "active": "articles",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/classroom-700.webp",
        "article": True,
    },
    "article-ai-governance.html": {
        "page": "articles",
        "title": "全球 AI 治理：从原则共识到规则落地 · 硅序漫谈｜了解AI",
        "description": "比较欧盟、中国、美国与国际组织的治理路径，理解人工智能全球治理的关键分歧。",
        "active": "articles",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/network-700.webp",
        "article": True,
    },
    "answers.html": {
        "page": "answers",
        "title": "学习自测与参考答案 · 硅序漫谈｜了解AI",
        "description": "12 道覆盖人工智能基础、技术、社会、司法与治理的自测题，附详细解析与教师答案速览。",
        "active": "",
        "scripts": ["assets/js/site.min.js", "assets/js/answers.min.js"],
    },
    "about.html": {
        "page": "about",
        "title": "关于本课 · 硅序漫谈｜了解AI",
        "description": "了解硅序漫谈的内容框架、学习方法与教材关联。",
        "active": "about",
        "scripts": ["assets/js/site.min.js"],
        "og_image": "assets/img/library-700.webp",
    },
    "contact.html": {
        "page": "contact",
        "title": "联系与交流 · 硅序漫谈｜了解AI",
        "description": "课程共建、内容纠错、学习交流或媒体联络，欢迎与课程团队联系。",
        "active": "contact",
        "scripts": ["assets/js/site.min.js"],
    },
    "learn.html": {
        "page": "learn",
        "title": "知识体系 · 15 讲系统学习 · 硅序漫谈｜了解AI",
        "description": "面向大学生自学的 AI 通识课程：15 个知识点，每讲包含讲解、可视化框架、典型情境与即时练习，可按顺序学习或直接跳转。",
        "active": "knowledge",
        "scripts": ["assets/js/site.min.js", "assets/js/learn.min.js"],
        "extra_css": ["assets/css/learn.min.css"],
        "og_image": "assets/img/classroom-700.webp",
    },
}

ICON = lambda name, cls="icon": f'<svg class="{cls}" aria-hidden="true"><use href="assets/icons.svg#i-{name}"></use></svg>'


def nav_item(label, href, key, active):
    current = key == active
    cls = "nav-link is-current" if current else "nav-link"
    aria = ' aria-current="page"' if current else ""
    return f'<a class="{cls}" href="{href}" data-nav="{key}"{aria}>{label}</a>'


def build_header(meta):
    page = meta["page"]
    active = meta["active"]
    home = page == "home"
    base = "" if home else "index.html"
    home_href = "#top" if home else "index.html"
    knowledge_href = "#knowledge" if home else "learn.html"
    articles_href = "#articles" if home else "articles.html"
    about_href = "#about" if home else "about.html"
    contact_href = "#contact" if home else "contact.html"
    works_current = " is-current" if active == "works" else ""
    works_aria = ' aria-current="page"' if active == "works" else ""
    cta_current = active == "answers"

    mobile_items = []
    mobile_items.append(
        f'<a href="{home_href}" data-nav="home"{" class=\"is-current\"" if active == "home" else ""}>首页</a>'
    )
    mobile_items.append(
        f'<a href="{knowledge_href}" data-nav="knowledge"{" class=\"is-current\"" if active == "knowledge" else ""}>知识体系</a>'
    )
    mobile_items.append(
        f"""<details>
          <summary data-nav="works" class="{("is-current" if active == "works" else "")}">作品 {ICON("chevron-down", "icon")}</summary>
          <div class="mobile-subnav">
            <span class="mobile-subnav__label">项目</span>
            <a href="project-justice.html">AI 与司法实践</a>
            <a href="project-ecology.html">生成式 AI 与信息生态</a>
            <a href="project-learning.html">AI 通识学习路径</a>
            <span class="mobile-subnav__label">实验与资源</span>
            <a href="experiment-verify.html">信息核查实验室</a>
            <a href="answers.html">学习自测与答案</a>
            <a href="learn.html">系统课程 · 15 讲</a>
            <a href="works.html">全部作品</a>
          </div>
        </details>"""
    )
    mobile_items.append(
        f'<a href="{articles_href}" data-nav="articles"{" class=\"is-current\"" if active == "articles" else ""}>文章</a>'
    )
    mobile_items.append(
        f'<a href="{about_href}" data-nav="about"{" class=\"is-current\"" if active == "about" else ""}>关于</a>'
    )
    mobile_items.append(
        f'<a href="{contact_href}" data-nav="contact"{" class=\"is-current\"" if active == "contact" else ""}>联系</a>'
    )
    mobile_nav = "\n".join(mobile_items)

    header = f"""
<a class="skip-link" href="#main">跳到主要内容</a>
<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    <a class="brand" href="{home_href}" aria-label="硅序漫谈｜了解AI 首页">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none"><path d="M16 10.2c-2.7-1.8-5.3-1.8-7 0v12c1.7-1.8 4.3-1.8 7 0 2.7-1.8 5.3-1.8 7 0v-12c-1.7-1.8-4.3-1.8-7 0Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 10.2v12" stroke="#b7ccff" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      <span>
        <span class="brand-name">硅序漫谈</span>
        <span class="brand-sub">了解AI</span>
      </span>
    </a>
    <nav class="site-nav" aria-label="主导航">
      {nav_item("首页", home_href, "home", active)}
      {nav_item("知识体系", knowledge_href, "knowledge", active)}
      <div class="nav-item nav-item--works">
        <button class="nav-link nav-trigger{works_current}" type="button" id="worksTrigger" aria-expanded="false" aria-controls="worksMega"{works_aria} data-nav="works">作品 {ICON("chevron-down")}</button>
      </div>
      {nav_item("文章", articles_href, "articles", active)}
      {nav_item("关于", about_href, "about", active)}
      {nav_item("联系", contact_href, "contact", active)}
    </nav>
    <div class="header-actions">
      <button class="header-search js-open-search" type="button" aria-label="搜索知识，快捷键 Command K">
        {ICON("search")}<span>搜索</span><span class="kbd">⌘K</span>
      </button>
      <a class="btn btn--primary header-cta{" is-current" if cta_current else ""}" href="answers.html">学习自测</a>
      <button class="menu-toggle" type="button" aria-label="打开导航菜单" aria-expanded="false" aria-controls="mobileMenu">
        {ICON("menu")}
      </button>
    </div>
  </div>
</header>

<div class="works-mega" id="worksMega" aria-hidden="true" aria-label="作品导航">
  <div class="mega-grid">
    <div class="mega-col">
      <div class="mega-label">{ICON("folder")}项目</div>
      <div class="mega-links">
        <a class="mega-link" href="project-justice.html">AI 与司法实践<span>人机协同与程序正义</span></a>
        <a class="mega-link" href="project-ecology.html">生成式 AI 与信息生态<span>内容生产链的重写</span></a>
        <a class="mega-link" href="project-learning.html">AI 通识学习路径<span>把教材变成行动</span></a>
      </div>
    </div>
    <div class="mega-col">
      <div class="mega-label">{ICON("play")}实验</div>
      <div class="mega-links">
        <a class="mega-link" href="experiment-verify.html">信息核查实验室<span>三道题练习证据意识</span></a>
        <a class="mega-link" href="answers.html#quiz">通识自测 12 题<span>立即检验理解</span></a>
        <a class="mega-link" href="works.html?filter=lab">全部实验<span>浏览互动练习</span></a>
      </div>
      <a class="mega-all" href="works.html">查看全部作品 {ICON("arrow-right")}</a>
    </div>
    <div class="mega-col">
      <div class="mega-label">{ICON("book")}资源</div>
      <div class="mega-links">
        <a class="mega-link" href="learn.html">系统课程<span>15 个知识点 · 即时练习</span></a>
        <a class="mega-link" href="articles.html#papers">学术论文专栏<span>五篇值得进入的论文</span></a>
        <a class="mega-link" href="about.html">教材与内容方法<span>我们的知识框架</span></a>
        <a class="mega-link" href="answers.html#answer-key">答案速览<span>教师与自学者适用</span></a>
      </div>
    </div>
    <div class="mega-col">
      <div class="mega-featured">
        <div class="mega-featured-media">
          <span class="mega-featured-tag">精选项目</span>
          <img src="assets/img/justice-700.webp" width="700" height="467" alt="正义女神手持天平的雕像" loading="lazy" decoding="async">
        </div>
        <div class="mega-featured-copy">
          <p>PROJECT / 01</p>
          <h3><a href="project-justice.html">AI 与司法实践</a></h3>
          <a class="text-link" href="project-justice.html">进入项目 {ICON("arrow-right")}</a>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="mobile-backdrop" id="mobileBackdrop" aria-hidden="true"></div>
<aside class="mobile-menu" id="mobileMenu" aria-hidden="true" aria-label="移动端导航">
  <div class="mobile-menu-inner">
    <div class="mobile-menu-head">
      <a class="brand" href="{home_href}" aria-label="硅序漫谈｜了解AI 首页">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none"><path d="M16 10.2c-2.7-1.8-5.3-1.8-7 0v12c1.7-1.8 4.3-1.8 7 0 2.7-1.8 5.3-1.8 7 0v-12c-1.7-1.8-4.3-1.8-7 0Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 10.2v12" stroke="#b7ccff" stroke-width="1.6" stroke-linecap="round"/></svg>
        </span>
        <span><span class="brand-name">硅序漫谈</span><span class="brand-sub">了解AI</span></span>
      </a>
      <button class="menu-close" type="button" aria-label="关闭导航菜单">{ICON("close")}</button>
    </div>
    <button class="mobile-search-btn js-open-search" type="button">{ICON("search")}<span>搜索知识、文章与项目</span><span class="kbd">⌘K</span></button>
    <nav class="mobile-nav" aria-label="移动端主导航">
      {mobile_nav}
    </nav>
    <div class="mobile-menu-foot">
      <a class="btn btn--primary" href="answers.html">开始学习自测</a>
      <p class="mobile-menu-note">内容框架参考《人工智能通识及应用》<br>高等教育出版社 · 唐郑熠 / 林江宏 / 王金水 主编</p>
    </div>
  </div>
</aside>

<div class="search-overlay" id="searchOverlay" aria-hidden="true">
  <div class="search-shell" role="dialog" aria-modal="true" aria-labelledby="searchDialogTitle">
    <h2 id="searchDialogTitle" class="sr-only">搜索硅序漫谈</h2>
    <div class="search-bar">
      {ICON("search")}
      <label class="sr-only" for="searchInput">搜索知识点、文章或项目</label>
      <input class="search-input" id="searchInput" type="search" placeholder="搜索知识点、文章或项目…" autocomplete="off" spellcheck="false" aria-controls="searchResults">
      <button class="menu-close" type="button" aria-label="关闭搜索" data-close-search>{ICON("close")}</button>
    </div>
    <div class="search-filters" id="searchFilters" role="tablist" aria-label="筛选内容类型"></div>
    <div class="search-summary"><span id="searchSummary" aria-live="polite">推荐内容</span><span>↑↓ 选择 · Enter 打开 · ESC 关闭</span></div>
    <div class="search-results" id="searchResults"></div>
    <div class="search-foot">
      <span>{ICON("compass")}知识索引覆盖教材 10 章与扩展专题</span>
      <span>硅序漫谈｜了解AI</span>
    </div>
  </div>
</div>

<button class="back-to-top" type="button" aria-label="返回页面顶部">
  {ICON("arrow-up")}
</button>
"""
    return header


def build_footer(meta):
    page = meta["page"]
    home_href = "#top" if page == "home" else "index.html"
    knowledge_href = "learn.html"
    return f"""
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="{home_href}" aria-label="硅序漫谈｜了解AI 首页">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none"><path d="M16 10.2c-2.7-1.8-5.3-1.8-7 0v12c1.7-1.8 4.3-1.8 7 0 2.7-1.8 5.3-1.8 7 0v-12c-1.7-1.8-4.3-1.8-7 0Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 10.2v12" stroke="#b7ccff" stroke-width="1.6" stroke-linecap="round"/></svg>
          </span>
          <span><span class="brand-name">硅序漫谈</span><span class="brand-sub">了解AI</span></span>
        </a>
        <p>面向大学生的 AI 通识伴学空间。以《人工智能通识及应用》教材为骨架，用问题、案例与练习建立可迁移的判断力。</p>
        <p class="footer-note">内容框架参考《人工智能通识及应用》<br>唐郑熠、林江宏、王金水 主编 · 高等教育出版社<br>课程编辑组独立维护</p>
      </div>
      <div class="footer-col">
        <h3>学习</h3>
        <div class="footer-links">
          <a href="{knowledge_href}">知识体系</a>
          <a href="works.html">作品与实践</a>
          <a href="answers.html">学习自测</a>
          <a href="answers.html#answer-key">答案速览</a>
        </div>
      </div>
      <div class="footer-col">
        <h3>内容</h3>
        <div class="footer-links">
          <a href="articles.html">全部文章</a>
          <a href="articles.html#papers">学术论文专栏</a>
          <a href="about.html">关于本课</a>
          <a href="about.html#framework">教材框架</a>
        </div>
      </div>
      <div class="footer-col">
        <h3>联系</h3>
        <div class="footer-links">
          <a href="contact.html">交流与共建</a>
          <a href="mailto:{SITE_EMAIL}">{SITE_EMAIL}</a>
          <a href="contact.html#faq">常见问题</a>
          <a href="dashboard.html">内容后台（演示）</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {YEAR} 硅序漫谈｜了解AI · 大学生 AI 伴学作品。本站为独立学习与教学设计项目，非出版机构官方网站；教材封面与出版信息版权归原作者及出版社所有。部分摄影素材来自 Unsplash。内容仅用于学习交流，具体政策与法律请以官方最新文件为准。</p>
      <div class="footer-bottom-meta">
        <a href="https://mall.hep.com.cn/goods-48620.html" target="_blank" rel="noopener noreferrer">教材信息 {ICON("external", "icon icon--12")}</a>
        <a href="#top">回到顶部</a>
      </div>
    </div>
  </div>
</footer>
"""


def build_page(filename, meta):
    fragment = (PAGES_DIR / filename).read_text(encoding="utf-8")
    page = meta["page"]
    scripts = "\n".join(
        f'  <script src="{src}" defer></script>' for src in meta.get("scripts", [])
    )
    extra_css = "\n".join(
        f'  <link rel="stylesheet" href="{css}">' for css in meta.get("extra_css", [])
    )
    description = html.escape(meta["description"], quote=True)
    title = html.escape(meta["title"])
    og_image = meta.get("og_image", "assets/img/data-700.webp")
    page_class = f' class="page page--{page}"'
    body_class = ' class="article-page-body"' if meta.get("article") else ""
    icon_sprite = (Path(__file__).resolve().parent / "icon-sprite.svg").read_text(encoding="utf-8")
    document = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:site_name" content="硅序漫谈｜了解AI">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{og_image}">
  <title>{title}</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/site.min.css">
{extra_css}
  <script>document.documentElement.classList.add('js');</script>
{scripts}
</head>
<body{body_class} id="top" data-page="{page}">
{icon_sprite}
{build_header(meta)}
<main id="main"{page_class}>
{fragment}
</main>
{build_footer(meta)}
</body>
</html>
"""
    (ROOT / filename).write_text(document.replace("assets/icons.svg#", "#"), encoding="utf-8")
    return filename


def main():
    for filename, meta in PAGES.items():
        path = PAGES_DIR / filename
        if not path.exists():
            print("skip (no fragment):", filename)
            continue
        build_page(filename, meta)
        print("built:", filename)


if __name__ == "__main__":
    main()
