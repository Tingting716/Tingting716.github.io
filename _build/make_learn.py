#!/usr/bin/env python3
"""Generate learn.html fragment: a 15-lesson, offline learning path."""
from pathlib import Path
import html

OUT = Path(__file__).resolve().parent / "pages" / "learn.html"

GROUPS = [
    ("基础与历史", "01", "从概念和历史建立坐标系"),
    ("技术原理", "02", "理解机器学习、深度学习与大模型"),
    ("应用实践", "03", "把工具用于学习、办公、创作与自动化"),
    ("跨学科专题", "04", "把技术放回司法、信息生态与治理"),
    ("素养与行动", "05", "形成可迁移的判断与责任"),
]


def icon(name, cls="icon"):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#i-{name}"></use></svg>'


def render_practice(practice):
    options = "".join(
        f'''<button class="practice-option" type="button" data-option="{letter}">
          <span class="practice-option-key">{letter}</span>
          <span>{text}</span>
        </button>'''
        for letter, text in practice["options"]
    )
    return f'''<div class="lesson-practice" data-practice data-correct="{practice["correct"]}">
              <div class="practice-head">
                <span class="practice-label">{icon("target")}即时练习</span>
                <span class="practice-type">单选 · 即时反馈</span>
              </div>
              <p class="practice-question">{practice["question"]}</p>
              <div class="practice-options" role="group" aria-label="即时练习选项">
                {options}
              </div>
              <div class="practice-feedback" data-practice-feedback hidden aria-live="polite"></div>
              <div class="practice-explanation" data-practice-explanation hidden>{practice["explanation"]}</div>
            </div>'''


def render_lesson(index, lesson):
    resources = "".join(
        f'<a class="text-link" href="{href}">{label} {icon("arrow-right")}</a>'
        for label, href in lesson.get("resources", [])
    )
    return f'''<article class="lesson" data-lesson="{lesson["key"]}" aria-labelledby="lesson-title-{lesson["key"]}"{" hidden" if index > 0 else ""}>
            <header class="lesson-head">
              <div class="lesson-kicker">
                <span class="eyebrow">{index + 1:02d} / {lesson["group"]}</span>
                <span class="lesson-chapter">{lesson["chapter"]}</span>
              </div>
              <h2 id="lesson-title-{lesson["key"]}">{lesson["title"]}</h2>
              <p class="lesson-dek">{lesson["dek"]}</p>
              <div class="lesson-meta">
                <span>{icon("clock")}{lesson["minutes"]} 分钟</span>
                <span>{icon("layers")}{lesson["tags"]}</span>
                <span>{icon("check-circle")}含即时练习</span>
              </div>
            </header>
            <div class="lesson-body">
              {lesson["body"]}
              {lesson["visual"]}
              <div class="lesson-example">
                <span class="lesson-example-label">典型情境</span>
                <p>{lesson["example"]}</p>
              </div>
              {render_practice(lesson["practice"])}
              <div class="lesson-takeaway">
                <span class="lesson-takeaway-label">{icon("spark")}一句话记住</span>
                <p>{lesson["takeaway"]}</p>
              </div>
              <div class="lesson-resources">
                <span class="lesson-resources-label">继续深入</span>
                {resources}
              </div>
            </div>
          </article>'''


def main():
    # Import content from the companion data module to keep this renderer readable.
    from learn_content import LESSONS

    group_blocks = []
    lesson_blocks = []
    select_groups = []

    for group_index, (group_name, group_number, group_desc) in enumerate(GROUPS, start=1):
        group_lessons = [l for l in LESSONS if l["group"] == group_name]
        links = []
        for lesson in group_lessons:
            number = LESSONS.index(lesson) + 1
            active = " is-active" if number == 1 else ""
            aria = ' aria-current="page"' if number == 1 else ""
            links.append(
                f'''<a class="lesson-nav-link{active}" href="#{lesson["key"]}" data-lesson-link="{lesson["key"]}"{aria}>
                  <span class="lesson-nav-number">{number:02d}</span>
                  <span class="lesson-nav-name">{lesson["short"]}</span>
                  <span class="lesson-nav-check" aria-label="已完成">{icon("check")}</span>
                </a>'''
            )
        group_blocks.append(
            f'''<div class="lesson-group">
              <div class="lesson-group-head">
                <span>{group_number}</span>
                <h3>{group_name}</h3>
                <small>{len(group_lessons)} 讲</small>
              </div>
              {''.join(links)}
            </div>'''
        )
        options = "".join(
            f'<option value="{lesson["key"]}">{LESSONS.index(lesson) + 1:02d} · {lesson["short"]}</option>'
            for lesson in group_lessons
        )
        select_groups.append(f'<optgroup label="{group_name}">{options}</optgroup>')

    for i, lesson in enumerate(LESSONS):
        lesson_blocks.append(render_lesson(i, lesson))

    fragment = f'''<section class="page-hero learn-hero" aria-labelledby="learn-title">
  <div class="container">
    <nav class="breadcrumbs" aria-label="面包屑">
      <a href="index.html">首页</a><span class="sep" aria-hidden="true">›</span><span aria-current="page">知识体系</span>
    </nav>
    <div class="learn-hero-grid">
      <div>
        <div class="eyebrow">《人工智能通识及应用》 / 系统学习</div>
        <h1 id="learn-title">十五讲，<br><span class="learn-title-a">建立完整的</span> <span class="learn-title-b">AI 通识。</span></h1>
        <p class="page-hero-desc">与教材十章对应，从基本概念、技术原理到应用、司法、信息生态与全球治理。每一讲都有清晰讲解、可视化框架和一道带即时解析的练习，适合大学生按顺序自学，也支持直接跳转。</p>
        <div class="learn-hero-facts">
          <span><strong>15</strong> 个知识点</span>
          <span><strong>05</strong> 个学习模块</span>
          <span><strong>≈ 3</strong> 小时</span>
          <span><strong>100%</strong> 离线可用</span>
        </div>
        <p class="learn-hero-source">内容框架参考《人工智能通识及应用》；拓展议题依据公开政策、机构资料与学术文献整理。</p>
      </div>
      <aside class="course-progress-card" aria-label="课程学习进度">
        <div class="course-progress-head">
          <span class="section-mini-label">Your progress</span>
          <strong><span data-course-percent>0</span><small>%</small></strong>
        </div>
        <div class="course-progress-bar" aria-hidden="true"><span data-course-progress></span></div>
        <p class="course-progress-copy"><span data-course-completed>0</span> / 15 讲已完成</p>
        <a class="course-resume" href="#p1-ai-definition" data-resume-link data-lesson-link="p1-ai-definition"><span data-resume-label>从第一讲开始</span> {icon("arrow-right")}</a>
        <p class="course-progress-note">进度仅保存在当前浏览器，不会上传。</p>
      </aside>
    </div>
  </div>
</section>

<section class="learn-page">
  <div class="container learn-layout">
    <aside class="learn-sidebar" aria-label="知识点导航">
      <div class="learn-sidebar-head">
        <span class="section-mini-label">Course index</span>
        <h2>知识点导航</h2>
        <p>可以按 01—15 顺序学习，也可以直接跳到感兴趣的一讲。</p>
      </div>
      <nav class="lesson-nav" aria-label="课程知识点">
        {''.join(group_blocks)}
      </nav>
      <div class="learn-sidebar-foot">
        <div class="learn-sidebar-progress">
          <span>已完成</span>
          <strong><span data-course-completed>0</span> / 15</strong>
        </div>
        <div class="course-progress-bar" aria-hidden="true"><span data-course-progress></span></div>
        <a class="learn-sidebar-test" href="answers.html">完成后去综合自测 {icon("arrow-right")}</a>
      </div>
    </aside>

    <div class="learn-main" id="learnMain">
      <div class="learn-mobile-nav">
        <label for="lessonJump">跳到知识点</label>
        <select id="lessonJump" data-lesson-select>
          {''.join(select_groups)}
        </select>
      </div>

      <div class="learn-toolbar">
        <div class="learn-toolbar-copy">
          <span class="section-mini-label">Current lesson</span>
          <strong data-lesson-position>第 01 讲 / 共 15 讲</strong>
        </div>
        <div class="learn-toolbar-actions">
          <button class="learn-mini-btn" type="button" data-lesson-prev aria-label="上一讲">{icon("chevron-left")}</button>
          <button class="learn-mini-btn" type="button" data-lesson-next aria-label="下一讲">{icon("chevron-right")}</button>
        </div>
      </div>

      <noscript>
        <div class="lesson-noscript">课程切换需要启用 JavaScript。你仍可以阅读下方的第一讲内容；其他讲义的静态文本也保存在本文件中。</div>
      </noscript>
      <p class="sr-only" data-lesson-live aria-live="polite"></p>

      <div class="lesson-stack">
        {''.join(lesson_blocks)}
      </div>

      <div class="lesson-pager" data-lesson-pager>
        <button class="lesson-pager-card" type="button" data-pager-prev>
          <span>上一讲</span>
          <strong data-pager-prev-title>—</strong>
        </button>
        <button class="lesson-pager-card is-next" type="button" data-pager-next>
          <span>下一讲</span>
          <strong data-pager-next-title>—</strong>
        </button>
      </div>

      <div class="lesson-completion">
        <p>{icon("check-circle")}完成本讲练习会自动记录进度；你也可以手动标记。</p>
        <div>
          <button class="btn btn--secondary" type="button" data-mark-current>标记本讲完成</button>
          <a class="btn btn--primary" href="answers.html">综合自测 {icon("arrow-right")}</a>
        </div>
      </div>
    </div>
  </div>
</section>
'''
    OUT.write_text(fragment, encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
