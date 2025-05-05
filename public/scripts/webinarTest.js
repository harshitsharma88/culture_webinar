let currentQuestion = 0;
let score = 0;
let timeLeftremaining = 30;
let timerInterval;
let answered = false;
let selectedOption = null;
let quizData = [];
let answerDetailsString = [];

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

window.addEventListener('load', async () => {
    const [{value: questions}, {value: webinarDetails}] = 
      await Promise.allSettled([getWebinarQuestionsCached(), getAppendWebinarDetailsQuestions()]);
    quizData = questions;
});

function startQuiz() {
  if (quizData.length === 0) {
    showToast('error', 'Error', 'Wait For Questions.');
    return;
  }
  const testContainer = document.querySelector("section.start-test-part");
  const previewContainer = document.querySelector("section.preview-part");
  initQuiz();
  testContainer.style.display = 'flex';
  previewContainer.style.display = 'none';
}

async function fetchGet(url, headers = {}, options = {}){
  try {
      const basePath = options.different ? '' : '/webinar/test';
      url = basePath + url;
      const response = await fetch(url, { headers :{ 
        contentType: 'application/json', 
        "Authorization": sessionStorage.getItem('webitkn'),
        ...headers}});
      if (!response.ok && response.status == 401) {
        // return location.replace('/');
      }
      const parsedResponse = options.notjson ? response : await response.json();
      !options.notoken && sessionStorage.setItem('webitkn', response.headers.get('Authorization'));
      return parsedResponse;
  } catch (error) {
    throw error; 
  }
}

async function fetchPost(url, data , headers = {}, options = {}){
    try{
          const basePath = options.different ? '' : '/webinar/test';
          url = basePath + url;
          const response = await fetch(url, 
            {
              method: 'POST', body: JSON.stringify(data), 
              headers: {
                'Content-Type': 'application/json',
                "Authorization": sessionStorage.getItem('webitkn'),
                ...headers
              }
            });
            if (!response.ok && response.status == 401) {
              // return location.replace('/');
            }
          const parsedResponse = options.notjson ? response : await response.json();
          !options.notoken && sessionStorage.setItem('webitkn', response.headers.get('Authorization'));
          return parsedResponse;
    } catch (error) {
      throw error;
    }
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
                // location.replace("/webinar");
            }, 3000);
            return;
        }
        if(!cachedData || cachedData.length == 0){
            showToast('error', 'Error', "No Question Found");
            setTimeout(() => {
              // location.replace("/webinar");
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
    if(!category || category === 'undefined' || category === 'null' || category === ''){
        showToast('error', 'Error', 'Category not found');
        setTimeout(() => {
            location.replace('/webinar');
        }, 3000);
        return;
    } 
    try {
        const {webinars} = await fetchGet(`/webinar/getwebinars?category=${category}`, {}, {different: true});
        const quizCountryNameIcon = document.querySelector('div.icn-on-country-name');
        quizCountryNameIcon.textContent = `Quiz On ${webinars[0].title}`;
    } catch (error) {
        console.log(error);
    }
}

// const quizData = [
//   {
//       question: "Which planet is known as the Red Planet?",
//       options: ["Venus", "Mars", "Jupiter", "Saturn"],
//       correct: 1
//   },
//   {
//       question: "Who painted the Mona Lisa?",
//       options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
//       correct: 2
//   },
//   {
//       question: "What is the largest ocean on Earth?",
//       options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
//       correct: 3
//   },
//   {
//       question: "Which element has the chemical symbol 'O'?",
//       options: ["Oxygen", "Gold", "Silver", "Iron"],
//       correct: 0
//   },
//   {
//       question: "Which country is home to the kangaroo?",
//       options: ["New Zealand", "South Africa", "Australia", "Brazil"],
//       correct: 2
//   },
//   {
//       question: "What is the capital city of Japan?",
//       options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
//       correct: 2
//   },
//   {
//       question: "Which famous scientist developed the theory of relativity?",
//       options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
//       correct: 1
//   },
//   {
//       question: "What is the largest organ in the human body?",
//       options: ["Brain", "Liver", "Heart", "Skin"],
//       correct: 3
//   },
//   {
//       question: "Which mountain is the tallest in the world?",
//       options: ["K2", "Mount Everest", "Mount Kilimanjaro", "Mount Fuji"],
//       correct: 1
//   },
//   {
//       question: "Which is the smallest prime number?",
//       options: ["0", "1", "2", "3"],
//       correct: 2
//   }
// ];

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
function loadQuestion() {
  // Reset state
  answered = false;
  selectedOption = null;
  timeLeftremaining = 30;
  
  // Reset options
  optionElements.forEach(option => {
      option.classList.remove('selected', 'correct', 'incorrect');
  });
  
  // Update UI
  questionElement.textContent = quizData[currentQuestion].Questions;
  currentQuestionElement.textContent = currentQuestion + 1;
  const qstnObj = quizData[currentQuestion]
  const currentOptions = [qstnObj.Option1, qstnObj.Option2, qstnObj.Option3, qstnObj.Option4];
  // Update options
  optionElements.forEach((option, index) => {
      option.textContent = currentOptions[index];
  });
  
  // Start timer
  startTimer();
}

// Start timer
function startTimer() {
  // Reset animation
  timerCircle.style.animation = 'none';
  void timerCircle.offsetWidth; // Trigger reflow
  timerCircle.style.animation = 'rotate 30s linear forwards';
  
  // Clear previous interval
  clearInterval(timerInterval);
  
  // Set initial timer color
  timerCircle.style.borderColor = '#4361ee';
  timerCircle.style.borderRightColor = 'transparent';
  timerElement.style.color = '#ffffff';
  
  // Start new timer
  timerElement.textContent = timeLeftremaining;
  timerInterval = setInterval(() => {
    timeLeftremaining--;
      timerElement.textContent = timeLeftremaining;
      
      // Change colors based on time remaining - using darker colors
      if (timeLeftremaining <= 5) {
          timerCircle.style.borderColor = '#d00000'; // Darker red
          timerCircle.style.borderRightColor = 'transparent';
          timerElement.style.color = '#d00000';
      } else if (timeLeftremaining <= 10) {
          timerCircle.style.borderColor = '#e85d04'; // Darker orange
          timerCircle.style.borderRightColor = 'transparent';
          timerElement.style.color = '#e85d04';
      } else if (timeLeftremaining <= 20) {
          timerCircle.style.borderColor = '#0077b6'; // Darker blue
          timerCircle.style.borderRightColor = 'transparent';
          timerElement.style.color = '#0077b6';
      }
      
      if (timeLeftremaining <= 0) {
          clearInterval(timerInterval);
          showCorrectAnswer();
      }
  }, 1000);
}

function selectOption() {
  if (answered) return;
  
  // Clear selected state
  optionElements.forEach(option => {
      option.classList.remove('selected');
  });
  
  // Add selected state
  this.classList.add('selected');
  selectedOption = parseInt(this.dataset.index);
  
  // Immediately check the answer
  checkAnswer();
}

function nextQuestion() {
  if (!answered) {
      showToast('error', 'Error', 'Please select an option or skip this question.');
      return;
  }
  currentQuestion++;
  storeAgentResponses();
  
  if (currentQuestion < quizData.length) {
      loadQuestion();
  } else {
      showResult();
  }
  updateProgressBar();
}

function skipQuestion() {
  const responseObject = {
    correctAns : quizData[currentQuestion].CurrectAns, 
    isCorrect : false, 
    question : quizData[currentQuestion].Questions,
    selectedAns : null
  };
  answerDetailsString.push(responseObject);
  clearInterval(timerInterval);
  storeAgentResponses();
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
  
  const correctAnsText = quizData[currentQuestion].CurrectAns;
  const responseObject = {correctAns : correctAnsText, isCorrect : false, question : quizData[currentQuestion].Questions};
  // Show correct and incorrect answers
  optionElements.forEach((option, index) => {
    if(option.classList.contains('selected')) responseObject.selectedAns = option.textContent;
      if (option.textContent === correctAnsText) {
          option.classList.add('correct');
          if (option.classList.contains('selected')) {
              score++;
              responseObject.isCorrect = true;
          }
      } else if (option.classList.contains('selected') && option.textContent != correctAnsText) {
          option.classList.remove('selected');
          option.classList.add('incorrect');
      }
      option.classList.remove('selected');
  });
  answerDetailsString.push(responseObject);
  // Add a delay before enabling the next button
  setTimeout(() => {
      nextButton.disabled = false;
  }, 1000);
}

// Show correct answer (when time runs out)
function showCorrectAnswer() {
  answered = true;
  
  const correctAns = quizData[currentQuestion].CurrectAns;
  
  optionElements.forEach((option, index) => {
    if (option.textContent === correctAns) {
      option.classList.add('correct');
    }
});
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
  let status = '';
  const percentage = (score / quizData.length) * 100;
  
  if (percentage >= 90) {
      status = "Passed";
      message = "Excellent! You're a quiz master!";
  } else if (percentage >= 70) {
      status = "Passed";
      message = "Great job! You have good knowledge!";
  } else if (percentage >= 60) {
      status = 'Passed'
      message = "Good effort! Keep learning!";
  } else {
      status = 'Failed';
      message = "Keep practicing! You'll improve!";
  }
  storeAgentResponses({status});
  resultInfoElement.textContent = message;
}

async function storeAgentResponses(options = {}){
  const percentage = (score / quizData.length) * 100;
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const data = {
    "categoryType": category,
    "country": category,
    "currentQuestion": options.currentQuestion || currentQuestion,
    "answerDetails": answerDetailsString,
    "status": options.status || "In Progress",
    "score": percentage,
    "certificateDownloaded": options.certificateDownloaded || false,
    "newAttempt": options.newAttempt || false
  };
  return await fetchPost('/submitresponse', data);
}

// Restart quiz
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  answerDetailsString = [];
  storeAgentResponses({newAttempt: true, currentQuestion: 1});
  resultContainer.style.display = 'none';
  quizBody.style.display = 'block';
  
  progressBar.style.width = '10%';
  loadQuestion();
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

// async function downloadAsPn2g() {
//   try {
//     const element = document.createElement("div");
//     element.style.position = "absolute";
//     element.style.left = "-9999px";
//     element.style.width = "1024px";
//     element.style.height = "635px";
//     document.body.appendChild(element);
//     let certificateHTML = await fetchGet('/webinar/getcertificate/Greece', {}, {different : true, notjson : true} );
//     certificateHTML = await certificateHTML.text();
//     element.innerHTML = certificateHTML;
//     await Promise.all(
//       Array.from(element.querySelectorAll("img")).map(img =>
//         img.complete ? Promise.resolve() :
//         new Promise(resolve => {
//           img.onload = img.onerror = resolve;
//         })
//       )
//     );
    
//     const canvas = await html2canvas(element, {
//       useCORS: true,
//       backgroundColor: null,
//       scale: 2 // for higher resolution
//     });
//     const image = canvas.toDataURL("image/png");

//     const link = document.createElement("a");
//     link.href = image;
//     link.download = "certificate.png";
//     // link.click();
//   } catch (error) {
//       console.error("Error downloading certificate:", error);
//   }
// }

async function donwloadCertificate(category) {
  try {
    let certificatebuffer = await fetchGet('/webinar/getcertificate/Greece', {}, {different : true, notjson : true} );
    const blob = await certificatebuffer.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'certificate.png';
    link.click();
  } catch (error) {
      console.error("Error downloading certificate:", error);
  }
}

async function previewCertificate(category){
  try {
    let certificateHTML = await fetchGet('/webinar/previewcertificate/Greece', {}, {different : true, notjson : true} );
    const html = await certificateHTML.text();
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.width = "1024px";
    container.style.height = "635px";
    container.style.overflow = "auto";
    container.style.border = "1px solid #ccc";
    container.style.margin = "20px auto";
    document.body.appendChild(container);
  } catch (error) {
      console.error("Error downloading certificate:", error);
  }
}
