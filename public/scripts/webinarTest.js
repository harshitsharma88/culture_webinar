let questions = [];
let current = 0;
let timer;
let timeLeft = 30;

function loadQuestion() {
  const q = questions[current];
  document.getElementById('question-title').innerText = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, q.answer);
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

fetch('/webinar/api/questions?id=' + new URLSearchParams(location.search).get('id'))
  .then(res => res.json())
  .then(data => {
    questions = data;
    loadQuestion();
  });
