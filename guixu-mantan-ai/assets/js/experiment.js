/* ==========================================================================
   硅序漫谈 — information verification lab
   ========================================================================== */
(function () {
  "use strict";

  const lab = document.querySelector("[data-lab]");
  if (!lab) return;

  const cases = Array.from(lab.querySelectorAll("[data-lab-case]"));
  const resultPanel = lab.querySelector("[data-lab-result]");
  const counter = document.querySelector("[data-lab-counter]");
  const doneNode = document.querySelector("[data-lab-done]");
  const scoreNode = document.querySelector("[data-lab-score]");
  const progressBar = document.querySelector("[data-lab-progress]");
  const resultCopy = document.querySelector("[data-lab-result-copy]");
  let current = 0;
  let score = 0;
  let completed = 0;
  let answered = new Set();

  const feedbackCopy = {
    "1": {
      correct:
        "<strong>正确。先找源头。</strong><p>图片“看起来真”不代表它属于“今天”和“此地”。通过反向图片搜索、网页时间戳与多源报道，确认最早发布时间与原始语境，是成本最低、收益最高的核查动作。AI 生成痕迹并不是首要判断依据。</p>",
      wrong:
        "<strong>更稳妥的答案是 B。</strong><p>放大观察图像细节，不一定能发现编辑或合成痕迹；评论区可能被操控；在未核实前转发会扩大误导。先寻找最早发布来源、时间与完整语境，再决定要不要相信。</p>",
      takeaway: "先确认内容“何时、何地、由谁、在什么语境下”发布。",
    },
    "2": {
      correct:
        "<strong>正确。寻找完整语境与独立信源。</strong><p>短视频的情绪冲击往往来自剪辑。寻找完整版、原始拍摄者与多个独立信源，既核对事件是否发生，也核对前因后果。AI 检测工具可能提供线索，但不能替代语境与来源核验。</p>",
      wrong:
        "<strong>更稳妥的答案是 C。</strong><p>没有明显合成痕迹，不等于视频呈现的是完整事实；大 V 的判断也不是独立证据。剪辑、断章取义同样会误导。先找到原始视频与独立报道，再判断。</p>",
      takeaway: "“不是深伪”不等于“就是真实”。剪辑与语境缺失同样重要。",
    },
    "3": {
      correct:
        "<strong>正确。核对机构、方法与原始文献。</strong><p>排版规范、参考文献多，都不能证明结论可靠。需要确认报告机构是否真实、作者是否具备相关背景、研究方法是否透明，并抽查引用文献与数据是否存在。不要让 AI 替代这一核验过程。</p>",
      wrong:
        "<strong>更稳妥的答案是 D。</strong><p>格式和引用数量是“表层信号”，无法证明研究质量。多个自媒体互相引用也可能形成虚假共识。回到报告机构、作者、方法、原始数据与文献，才能形成可复核的判断。</p>",
      takeaway: "来源可信度需要核查，不能由排版、引用数量或传播规模替代。",
    },
  };

  function updateAside() {
    if (counter) counter.textContent = String(Math.min(current + 1, cases.length));
    if (doneNode) doneNode.textContent = String(completed);
    if (scoreNode) scoreNode.textContent = String(score);
    if (progressBar) progressBar.style.width = `${(completed / cases.length) * 100}%`;
  }

  function focusHeading(container) {
    const heading = container.querySelector("h3");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  function checkCurrent() {
    const panel = cases[current];
    if (!panel) return;
    const selected = panel.querySelector("input[type='radio']:checked");
    const feedback = panel.querySelector("[data-lab-feedback]");
    const checkButton = panel.querySelector("[data-lab-check]");
    const nextButton = panel.querySelector("[data-lab-next]");

    if (!selected) {
      if (feedback) {
        feedback.hidden = false;
        feedback.className = "lab-feedback is-warning";
        feedback.innerHTML = "<strong>先选择一个动作。</strong><p>每一个选择都代表一种核查策略。请选出你认为最能接近事实的下一步。</p>";
      }
      return;
    }

    if (answered.has(current)) return;
    answered.add(current);
    completed += 1;

    const isCorrect = selected.value === panel.dataset.correct;
    if (isCorrect) score += 1;

    panel.querySelectorAll(".lab-option").forEach((option) => {
      const input = option.querySelector("input");
      option.classList.remove("is-correct", "is-wrong");
      if (input.value === panel.dataset.correct) option.classList.add("is-correct");
      else if (input.checked) option.classList.add("is-wrong");
      input.disabled = true;
    });

    if (feedback) {
      const data = feedbackCopy[panel.dataset.labCase] || feedbackCopy["1"];
      feedback.hidden = false;
      feedback.className = `lab-feedback ${isCorrect ? "is-success" : "is-error"}`;
      feedback.innerHTML = `${isCorrect ? data.correct : data.wrong}<p class="lab-takeaway"><strong>带走一句：</strong>${data.takeaway}</p>`;
    }

    if (checkButton) {
      checkButton.hidden = true;
    }
    if (nextButton) {
      nextButton.hidden = false;
      if (current === cases.length - 1) {
        nextButton.innerHTML = `查看实验总结<svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>`;
      }
    }

    updateAside();
  }

  function moveNext() {
    if (current < cases.length - 1) {
      cases[current].hidden = true;
      current += 1;
      cases[current].hidden = false;
      updateAside();
      focusHeading(cases[current]);
      const stage = lab.querySelector(".lab-stage");
      stage?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      finish();
    }
  }

  function finish() {
    cases.forEach((panel) => (panel.hidden = true));
    if (resultPanel) {
      resultPanel.hidden = false;
      if (resultCopy) {
        if (score === cases.length) {
          resultCopy.textContent = "三个情境全部判断正确。你使用的不是“直觉”，而是一套可复用的证据顺序：停一下、找来源、横向比较、保留不确定。";
        } else if (score > 0) {
          resultCopy.textContent = `你答对了 ${score} / ${cases.length} 题。比分数更重要的是：在遇到不确定信息时，先选择能带来证据的动作，而不是急着下结论。`;
        } else {
          resultCopy.textContent = "这次没有答对，但实验的目标不是评分。回看每道题的解释，试着把“找来源、看语境、核证据”变成下一次阅读的默认动作。";
        }
      }
    }
    if (counter) counter.textContent = String(cases.length);
    if (doneNode) doneNode.textContent = String(cases.length);
    if (progressBar) progressBar.style.width = "100%";
    const resultHeading = resultPanel?.querySelector("h3");
    if (resultHeading) {
      resultHeading.setAttribute("tabindex", "-1");
      resultHeading.focus({ preventScroll: true });
    }
  }

  function reset() {
    current = 0;
    score = 0;
    completed = 0;
    answered = new Set();
    cases.forEach((panel, index) => {
      panel.hidden = index !== 0;
      panel.querySelectorAll("input[type='radio']").forEach((input) => {
        input.checked = false;
        input.disabled = false;
      });
      panel.querySelectorAll(".lab-option").forEach((option) => {
        option.classList.remove("is-correct", "is-wrong");
      });
      const feedback = panel.querySelector("[data-lab-feedback]");
      if (feedback) {
        feedback.hidden = true;
        feedback.innerHTML = "";
        feedback.className = "lab-feedback";
      }
      const checkButton = panel.querySelector("[data-lab-check]");
      const nextButton = panel.querySelector("[data-lab-next]");
      if (checkButton) checkButton.hidden = false;
      if (nextButton) {
        nextButton.hidden = true;
        if (index === cases.length - 1) {
          nextButton.innerHTML = `查看实验总结<svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>`;
        } else {
          nextButton.innerHTML = `下一个案例<svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>`;
        }
      }
    });
    if (resultPanel) resultPanel.hidden = true;
    updateAside();
    lab.querySelector(".lab-stage")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  cases.forEach((panel) => {
    panel.querySelector("[data-lab-check]")?.addEventListener("click", checkCurrent);
    panel.querySelector("[data-lab-next]")?.addEventListener("click", moveNext);
  });

  document.querySelectorAll("[data-lab-restart]").forEach((button) => {
    button.addEventListener("click", reset);
  });

  updateAside();
})();
