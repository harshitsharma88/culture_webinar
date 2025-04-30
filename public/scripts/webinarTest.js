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
