const questions = [
  {
    question: "Which HTML tag is used to define an internal stylesheet?",
    answers: [
      { text: "<script>", correct: false },
      { text: "<style>", correct: true },
      { text: "<css>", correct: false },
      { text: "<link>", correct: false },
    ]
  },
  {
    question: "Which of the following is NOT a valid CSS position value?",
    answers: [
      { text: "static", correct: false },
      { text: "fixed", correct: false },
      { text: "sticky", correct: false },
      { text: "float", correct: true },
    ]
  },
  {
    question: "In CSS, what does the 'z-index' property control?",
    answers: [
      { text: "The size of an element", correct: false },
      { text: "The order of overlapping elements", correct: true },
      { text: "The opacity of an element", correct: false },
      { text: "The visibility of an element", correct: false },
    ]
  },
  {
    question: "Which method is used to select an element by its ID in JavaScript?",
    answers: [
      { text: "document.querySelector()", correct: false },
      { text: "document.getElementsByClassName()", correct: false },
      { text: "document.getElementById()", correct: true },
      { text: "document.getElementsByTagName()", correct: false },
    ]
  },
  {
    question: "What does the flexbox layout in CSS help with?",
    answers: [
      { text: "Creating animations", correct: false },
      { text: "Aligning and distributing items", correct: true },
      { text: "Making API calls", correct: false },
      { text: "Handling user input", correct: false },
    ]
  }
];

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextBtn = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

// Initialize quiz
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextBtn.innerText = "Next ⏭";
  showQuestion();
}

// Show question
function showQuestion() {
  resetState();
  let currentQuestion = questions[currentQuestionIndex];
  questionElement.innerText = currentQuestion.question;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer.text;
    button.classList.add("btn");
    button.addEventListener("click", selectAnswer);
    if (answer.correct) button.dataset.correct = answer.correct;
    answerButtons.appendChild(button);
  });
}

// Reset before next question
function resetState() {
  nextBtn.style.display = "none";
  answerButtons.innerHTML = "";
}

// Check answer
function selectAnswer(e) {
  const selectedBtn = e.target;
  const correct = selectedBtn.dataset.correct === "true";
  selectedBtn.classList.add(correct ? "correct" : "incorrect");

  Array.from(answerButtons.children).forEach(button => {
    if (button.dataset.correct === "true") button.classList.add("correct");
    button.disabled = true;
  });

  if (correct) score++;
  nextBtn.style.display = "block";
}

// Show final score
function showScore() {
  resetState();
  questionElement.innerHTML = `🎉 You scored ${score} out of ${questions.length}!`;
  nextBtn.innerText = "Play Again 🔁";
  nextBtn.style.display = "block";
}

// Handle Next
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

startQuiz();

// JOKE API FUNCTIONALITY
const jokeElement = document.getElementById("joke");
const getJokeBtn = document.getElementById("get-joke");

getJokeBtn.addEventListener("click", fetchJoke);

async function fetchJoke() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
    const data = await res.json();
    jokeElement.innerText = data.joke;
  } catch (err) {
    jokeElement.innerText = "😅 Oops! Couldn't fetch a joke right now.";
  }
}
