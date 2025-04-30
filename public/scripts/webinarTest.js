let questions = [];
let current = 0;
let timer;
let timeLeft = 30;

window.addEventListener('load', async () => {
    await getAppendWebinarDetailsQuestions();
    const webquestions = await getWebinarQuestionsCached();
    questions = webquestions;
    loadQuestion();
});

async function fetchGet(url, headers = {}, options = {}){
    const basePath = options.different ? '' : '/webinar/test';
    url = basePath + url;
    const response = await fetch(url, {contentType: 'application/json', ...headers});
    return await response.json();
}

async function fetchPost(url, data , headers = {}, options = {}){
    const basePath = options.different ? '' : '/webinar/test';
    url = basePath + url;
    const response = await fetch(url, {method: 'POST', body: JSON.stringify(data), contentType: 'application/json', ...headers});
    return await response.json();
}

const getWebinarQuestionsCached = (() => {
    let cachedData = null;
    let triedOnce = false
    return async () => {
      if (!cachedData && !triedOnce) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        try {
        const {questions: response} = await fetchGet(`/getquestions?category=${category}`);
          cachedData = response;
          triedOnce = true;
        } catch (error) {
            triedOnce = true;
            showToast('error', 'Error', "Can't Get the Details");
            setTimeout(() => {
                location.replace("/webinar");
            }, 3000);
            return;
        }
        if(!cachedData || cachedData.length == 0){
            showToast('error', 'Error', "No Question Found");
            setTimeout(() => {
              location.replace("/webinar");
            }, 3000);
            return;
        }
      }
      return cachedData;
    };
})();

async function getAppendWebinarDetailsQuestions(){
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    console.log(category);
    if(!category || category === 'undefined' || category === 'null' || category === ''){
        showToast('error', 'Error', 'Category not found');
        setTimeout(() => {
            location.replace('/webinar');
        }, 3000);
        return;
    } 
    try {
        const response = await fetchGet(`/webinar/getwebinars?category=${category}`, {}, {different: true});
    } catch (error) {
        console.log(error);
    }
}

function loadQuestion() {
  const q = questions[current];
  document.getElementById('question-title').innerText = q.Questions;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  [q.Option1, q.Option2, q.Option3, q.Option4].forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, q.CurrectAns);
    optionsDiv.appendChild(btn);
  });
  startTimer();
}

function handleAnswer(selected, correct) {
  clearInterval(timer);
  [...document.getElementById('options').children].forEach(btn => {
    btn.disabled = true;
    if (btn.innerText === correct) btn.classList.add('correct');
    if (btn.innerText === selected && selected !== correct) btn.classList.add('wrong');
  });
  document.getElementById('next-button').disabled = false;
  sendAnswer(selected === correct);
}

function sendAnswer(correct) {
  fetch('/webinar/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId: questions[current].id, correct })
  });
}

function startTimer() {
  timeLeft = 30;
  document.getElementById('time-remaining').innerText = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('time-remaining').innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      handleAnswer(null, questions[current].answer);
    }
  }, 1000);
}

document.getElementById('next-button').onclick = () => {
  current++;
  document.getElementById('next-button').disabled = true;
  if (current < questions.length) {
    loadQuestion();
  } else {
    alert('Test Completed');
    window.location.href = '/webinar';
  }
};

async function sendAgentAnswerResponse(questionID, ) {
    
}


function showToast(type, title, message, duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
  
    let icon = '';
    switch (type) {
      case 'success':
        icon = 'fa-circle-check';
        break;
      case 'error':
        icon = 'fa-circle-xmark';
        break;
      case 'warning':
        icon = 'fa-triangle-exclamation';
        break;
    }
  
    toast.innerHTML = `
          <i class="toast-icon fas ${icon}"></i>
          <div class="toast-content">
              <div class="toast-title">${title}</div>
              <div class="toast-message">${message}</div>
          </div>
          <i class="toast-close fas fa-times"></i>
      `;
  
    toastContainer.appendChild(toast);
  
    // Remove toast after animation
    setTimeout(() => {
      toast.remove();
    }, duration);
  
    // Close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });
}


const quizData = [
  {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1
  },
  {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correct: 2
  },
  {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correct: 3
  },
  {
      question: "Which element has the chemical symbol 'O'?",
      options: ["Oxygen", "Gold", "Silver", "Iron"],
      correct: 0
  },
  {
      question: "Which country is home to the kangaroo?",
      options: ["New Zealand", "South Africa", "Australia", "Brazil"],
      correct: 2
  },
  {
      question: "What is the capital city of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      correct: 2
  },
  {
      question: "Which famous scientist developed the theory of relativity?",
      options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
      correct: 1
  },
  {
      question: "What is the largest organ in the human body?",
      options: ["Brain", "Liver", "Heart", "Skin"],
      correct: 3
  },
  {
      question: "Which mountain is the tallest in the world?",
      options: ["K2", "Mount Everest", "Mount Kilimanjaro", "Mount Fuji"],
      correct: 1
  },
  {
      question: "Which is the smallest prime number?",
      options: ["0", "1", "2", "3"],
      correct: 2
  }
];

let currentQuestion = 0;
let score = 0;
let timeLeftBehind = 30;
let timerInterval;
let answered = false;
let selectedOption = null;

const progressBar = document.getElementById('progress-bar');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const questionElement = document.getElementById('question');
const optionElements = document.querySelectorAll('.option');
const nextButton = document.getElementById('next-btn');
const skipButton = document.getElementById('skip-btn');
const timerElement = document.getElementById('timer');
const timerCircle = document.getElementById('timer-circle');
const resultContainer = document.getElementById('result-container');
const quizBody = document.querySelector('.quiz-body');
const scoreElement = document.getElementById('score');
const resultInfoElement = document.getElementById('result-info');
const restartButton = document.getElementById('restart-btn');

// Initialize the quiz
function initQuiz() {
  loadQuestion();
  totalQuestionsElement.textContent = quizData.length;
  
  // Add event listeners to options
  optionElements.forEach(option => {
      option.addEventListener('click', selectOption);
  });
  
  // Add event listeners to buttons
  nextButton.addEventListener('click', nextQuestion);
  skipButton.addEventListener('click', skipQuestion);
  restartButton.addEventListener('click', restartQuiz);
}

// Load question
function startTimer() {
// Reset animation
timerCircle.style.animation = 'none';
void timerCircle.offsetWidth; // Trigger reflow
timerCircle.style.animation = 'rotate 30s linear forwards';

// Clear previous interval
clearInterval(timerInterval);

// Start new timer
timerElement.textContent = timeLeftBehind;
timerInterval = setInterval(() => {
    timeLeftBehind--;
    timerElement.textContent = timeLeftBehind;
    
    if (timeLeftBehind <= 0) {
        clearInterval(timerInterval);
        showCorrectAnswer();
    }
}, 1000);
}

// Load question
function loadQuestion() {
// Reset state
answered = false;
selectedOption = null;
timeLeftBehind = 30; // updated

// Reset options
optionElements.forEach(option => {
    option.classList.remove('selected', 'correct', 'incorrect');
});

// Update UI
questionElement.textContent = quizData[currentQuestion].question;
currentQuestionElement.textContent = currentQuestion + 1;

// Update options
optionElements.forEach((option, index) => {
    option.textContent = quizData[currentQuestion].options[index];
});

// Start timer
startTimer();
}
// Select option
function selectOption() {
  if (answered) return;
  
  // Clear selected state
  optionElements.forEach(option => {
      option.classList.remove('selected');
  });
  
  // Add selected state
  this.classList.add('selected');
  selectedOption = parseInt(this.dataset.index);
}

// Next question
function nextQuestion() {
  if (!answered && selectedOption !== null) {
      checkAnswer();
  } else if (!answered) {
      alert("Please select an option or skip this question.");
      return;
  }
  
  currentQuestion++;
  
  if (currentQuestion < quizData.length) {
      loadQuestion();
      updateProgressBar();
  } else {
      showResult();
  }
}

// Skip question
function skipQuestion() {
  clearInterval(timerInterval);
  
  currentQuestion++;
  
  if (currentQuestion < quizData.length) {
      loadQuestion();
      updateProgressBar();
  } else {
      showResult();
  }
}

// Check answer
function checkAnswer() {
  answered = true;
  clearInterval(timerInterval);
  
  const correctIndex = quizData[currentQuestion].correct;
  
  // Show correct and incorrect answers
  optionElements.forEach((option, index) => {
      if (index === correctIndex) {
          option.classList.add('correct');
      } else if (index === selectedOption && selectedOption !== correctIndex) {
          option.classList.add('incorrect');
      }
  });
  
  // Update score
  if (selectedOption === correctIndex) {
      score++;
  }
  
  // Add a delay before enabling the next button
  setTimeout(() => {
      nextButton.disabled = false;
  }, 1000);
}

// Show correct answer (when time runs out)
function showCorrectAnswer() {
  answered = true;
  
  const correctIndex = quizData[currentQuestion].correct;
  
  // Show correct answer
  optionElements[correctIndex].classList.add('correct');
}

// Update progress bar
function updateProgressBar() {
  const progress = (currentQuestion / quizData.length) * 100;
  progressBar.style.width = `${progress}%`;
}

// Show result
function showResult() {
  quizBody.style.display = 'none';
  resultContainer.style.display = 'block';
  scoreElement.textContent = `${score}/${quizData.length}`;
  
  let message = '';
  const percentage = (score / quizData.length) * 100;
  
  if (percentage >= 90) {
      message = "Excellent! You're a quiz master!";
  } else if (percentage >= 70) {
      message = "Great job! You have good knowledge!";
  } else if (percentage >= 50) {
      message = "Good effort! Keep learning!";
  } else {
      message = "Keep practicing! You'll improve!";
  }
  
  resultInfoElement.textContent = message;
}

// Restart quiz
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  
  resultContainer.style.display = 'none';
  quizBody.style.display = 'block';
  
  progressBar.style.width = '10%';
  loadQuestion();
}

// Initialize the quiz when the page loads
window.onload = initQuiz;