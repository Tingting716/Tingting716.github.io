/* ==========================================================================
   硅序漫谈 — self-check interaction
   ========================================================================== */
(function () {
  "use strict";

  const quiz = document.querySelector("[data-quiz-questions]");
  if (!quiz) return;

  const questions = Array.from(quiz.querySelectorAll("[data-question]"));
  const total = questions.length;
  const answeredNode = document.querySelector("[data-quiz-answered]");
  const correctNode = document.querySelector("[data-quiz-correct]");
  const progressNode = document.querySelector("[data-quiz-progress]");
  const result = document.querySelector("[data-quiz-result]");
  const submitButton = document.querySelector("[data-quiz-submit]");
  const resetButton = document.querySelector("[data-quiz-reset]");
  const revealButton = document.querySelector("[data-quiz-reveal]");
  let submitted = false;
  let allRevealed = false;

  document.querySelectorAll("[data-quiz-total]").forEach((node) => {
    node.textContent = String(total);
  });

  function selectedAnswer(question) {
    const checked = question.querySelector("input[type='radio']:checked");
    return checked ? checked.value : null;
  }

  function getStats() {
    let answered = 0;
    let correct = 0;
    questions.forEach((question) => {
      const answer = selectedAnswer(question);
      if (answer) answered += 1;
      if (answer && answer === question.dataset.correct) correct += 1;
    });
    return { answered, correct };
  }

  function updateProgress() {
    const { answered, correct } = getStats();
    if (answeredNode) answeredNode.textContent = String(answered);
    if (correctNode) correctNode.textContent = String(correct);
    if (progressNode) progressNode.style.width = `${(answered / total) * 100}%`;
  }

  function showAnswers(show) {
    questions.forEach((question) => {
      const answer = question.querySelector("[data-answer]");
      if (answer) answer.hidden = !show;
    });
  }

  function clearMarks() {
    questions.forEach((question) => {
      question.classList.remove("is-correct", "is-wrong");
      question.querySelectorAll(".question-option").forEach((option) => {
        option.classList.remove("correct", "chosen-wrong");
      });
    });
  }

  function evaluate(showResult = true) {
    const { answered, correct } = getStats();
    questions.forEach((question) => {
      const answer = selectedAnswer(question);
      const chosen = question.querySelector(
        `.question-option[data-option="${answer}"]`
      );
      const correctOption = question.querySelector(
        `.question-option[data-option="${question.dataset.correct}"]`
      );
      question.classList.remove("is-correct", "is-wrong");
      question.querySelectorAll(".question-option").forEach((option) => {
        option.classList.remove("correct", "chosen-wrong");
      });
      if (!answer) return;
      correctOption?.classList.add("correct");
      if (answer === question.dataset.correct) {
        question.classList.add("is-correct");
      } else {
        question.classList.add("is-wrong");
        chosen?.classList.add("chosen-wrong");
      }
    });

    showAnswers(true);
    updateProgress();

    if (!showResult) return;

    if (!result) return;
    result.hidden = false;
    if (answered === 0) {
      result.innerHTML =
        "<strong>还没有选择答案</strong><p>先完成至少一道题，再查看解析。你也可以使用“展开全部答案”直接阅读。</p>";
      return;
    }
    const percent = Math.round((correct / total) * 100);
    let message = "继续阅读对应章节，看看哪个概念还可以讲得更清楚。";
    if (percent >= 84) message = "理解扎实。试着用自己的话解释给同学听，或进入项目实践。";
    else if (percent >= 60) message = "基础不错。回看错题解析，并联系一个真实案例。";
    else if (percent < 40) message = "建议先回到知识地图，从基础与历史模块重新建立坐标。";
    const remaining = total - answered;
    result.innerHTML = `<strong>${correct} / ${total} 题正确</strong><p>${message}${remaining > 0 ? ` 还有 ${remaining} 题未作答，本次得分按已答题计算。` : ""}</p>`;
  }

  quiz.addEventListener("change", () => {
    updateProgress();
    if (submitted) evaluate(false);
  });

  submitButton?.addEventListener("click", () => {
    submitted = true;
    allRevealed = false;
    if (revealButton) revealButton.textContent = "展开全部答案";
    evaluate(true);
    if (result) {
      result.setAttribute("tabindex", "-1");
      result.focus({ preventScroll: true });
    }
  });

  revealButton?.addEventListener("click", () => {
    allRevealed = !allRevealed;
    showAnswers(allRevealed);
    revealButton.textContent = allRevealed ? "收起全部答案" : "展开全部答案";
    if (!allRevealed && !submitted) {
      clearMarks();
    }
    if (allRevealed && !submitted) {
      if (result) {
        result.hidden = false;
        result.innerHTML =
          "<strong>答案已展开</strong><p>本模式不计算得分。建议先独立作答，再对照解析讨论。</p>";
      }
    } else if (!allRevealed && !submitted && result) {
      result.hidden = true;
    }
  });

  resetButton?.addEventListener("click", () => {
    submitted = false;
    allRevealed = false;
    questions.forEach((question) => {
      question.querySelectorAll("input[type='radio']").forEach((input) => {
        input.checked = false;
      });
    });
    clearMarks();
    showAnswers(false);
    updateProgress();
    if (result) {
      result.hidden = true;
      result.innerHTML = "";
    }
    if (revealButton) revealButton.textContent = "展开全部答案";
    const firstQuestion = questions[0];
    if (firstQuestion) firstQuestion.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  updateProgress();
})();
