// Переход между комнатами
function goToRoom(id){
  document.querySelectorAll('.room').forEach(r=>r.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Сохранение данных пользователя
document.getElementById('userForm').addEventListener('submit', e=>{
  e.preventDefault();
  localStorage.setItem('user', JSON.stringify({ name:name.value, age:age.value }));
  goToRoom('tests');
});

// Звуки (тикание и сердцебиение)
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
function playTick(){const o=audioCtx.createOscillator(); o.frequency.value=1000; o.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+0.05);}
function playHeart(){const o=audioCtx.createOscillator(); o.frequency.value=80; o.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+0.2);}

// Тесты
let current=0, score=0, answered=0, time=10, timer, stressLevel=0, activeTest;

const tests = {
  logic:{title:"ЛОГИКА", questions:[
    {q:"Когда получаешь противоречивую информацию, как действуешь?", 
     a:[["Проверяю каждый источник и факты",3],["Принимаю то, что кажется правильным",1],["Не обращаю внимания и продолжаю",0]]},
    {q:"Перед сложной задачей, что делаешь?", 
     a:[["Разбиваю задачу на маленькие шаги",3],["Делаю наугад",1],["Откладываю и жду решения",0]]},
    {q:"Если допустил ошибку, как реагируешь?", 
     a:[["Учусь на ошибке",3],["Думаю, что всё провалилось",0],["Считаю случайностью",1]]},
    {q:"Нужно придумать нестандартное решение, что делаешь?", 
     a:[["Анализирую и сравниваю варианты",3],["Делаю интуитивно",1],["Жду, пока кто-то решит",0]]},
    {q:"Когда принимаешь решение, о чём думаешь?", 
     a:[["О последствиях и рисках",3],["О текущем моменте",1],["Редко думаю о последствиях",0]]}
  ]},
  drive:{title:"СТРЕМЛЕНИЕ", questions:[
    {q:"Есть важная цель. Что делаешь?", 
     a:[["Иду до конца",3],["Пробую, если есть настроение",1],["Сдаюсь, если сложно",0]]},
    {q:"Нет мотивации, как поступаешь?", 
     a:[["Применяю дисциплину",3],["Жду вдохновения",1],["Бросаю попытку",0]]},
    {q:"Ты завершаешь начатое?", 
     a:[["Да, всегда",3],["Иногда откладываю",1],["Редко завершаю",0]]},
    {q:"Неудача случилась. Как реагируешь?", 
     a:[["Считаю временной и продолжаю",3],["Сбивает с толку",1],["Думаю, что всё потеряно",0]]},
    {q:"Контролируешь процесс задачи?", 
     a:[["Да, полностью",3],["Частично",1],["Нет",0]]}
  ]},
  choice:{title:"ВЫБОР", questions:[
    {q:"При давлении со стороны, как действуешь?", 
     a:[["Хладнокровно принимаю решение",3],["Иногда импульсивно",1],["Панически реагирую",0]]},
    {q:"Ошибка произошла. Твои действия?", 
     a:[["Принимаю и исправляю",3],["Ищу оправдания",1],["Избегаю и не решаю",0]]},
    {q:"Перед риском, как поступаешь?", 
     a:[["Планирую и осознанно иду",3],["Иду интуитивно",1],["Избегаю риска",0]]},
    {q:"Сложный выбор, что делаешь?", 
     a:[["Выбираю и стараюсь пройти",3],["Иногда пробую осторожно",1],["Не выбираю сложный путь",0]]},
    {q:"Последствия решений?", 
     a:[["Принимаю и оцениваю",3],["Откладываю анализ",1],["Боюсь и избегаю",0]]}
  ]}
};

// Запуск теста
function startTest(type){
  activeTest = tests[type];
  current = 0; score = 0; answered = 0; stressLevel = 0;
  document.body.classList.add('stress-low');
  document.getElementById('testTitle').innerText = activeTest.title;
  goToRoom('test');
  showQuestion();
}

// Применение стресса (мягкая тряска)
function applyStress(){
  document.body.classList.remove('stress-low','stress-mid','stress-high');
  if(stressLevel===0) document.body.classList.add('stress-low');
  else if(stressLevel===1) document.body.classList.add('stress-mid');
  else document.body.classList.add('stress-high');
}

// Показ вопроса
function showQuestion(){
  resetTimer();
  const q = activeTest.questions[current];
  const qEl = document.getElementById('question');
  qEl.classList.remove('fade'); void qEl.offsetWidth; qEl.classList.add('fade');
  qEl.innerText = q.q;

  const aEl = document.getElementById('answers');
  aEl.innerHTML = "";
  q.a.forEach(([text, points])=>{
    const b = document.createElement('button');
    b.innerText = text;
    b.onclick = ()=>{ score+=points; answered++; next(); };
    aEl.appendChild(b);
  });
}

// Таймер
function resetTimer(){
  clearInterval(timer);
  time = 10;
  timer = setInterval(()=>{
    time--;
    document.getElementById('timer').innerText="⏳ "+time;
    if(time<=3){ playTick(); playHeart(); }
    if(time<=0){ stressLevel++; applyStress(); next(); }
  },1000);
}

// Переход к следующему вопросу
function next(){
  clearInterval(timer);
  current++;
  if(current < 5){
    showQuestion();
  } else {
    showResult();
  }
}

// Показ результата
function showResult(){
  clearInterval(timer);

  // Отключаем тряску после окончания теста
  document.getElementById('test').classList.remove('stress-high');
  document.body.classList.remove('stress-high','stress-mid','stress-low');
  document.body.classList.add('stress-low');

  let state, analysis;
  if(answered===0){ 
      state="ПЕРЕГРУЗКА"; 
      analysis=`Ты не выбрал ни одного варианта. Это указывает на высокую пассивность и потенциально трудные дни впереди.`;
  } else if(stressLevel<=1 && score>=12){ 
      state="КОНТРОЛЬ"; 
      analysis=`Ты сохранил ясность мышления под давлением. Решения продуманы, ты анализируешь информацию без паники.`; 
  } else if(score>=7){ 
      state="НАПРЯЖЕНИЕ"; 
      analysis=`Стресс начинает влиять на мышление. Решения принимаются быстрее, но иногда менее продуманно.`; 
  } else { 
      state="ПЕРЕГРУЗКА"; 
      analysis=`Высокий стресс ограничил мышление. Решения принимались импульсивно или автоматически.`; 
  }

  document.getElementById('resultText').innerHTML = `<strong>Состояние: ${state}</strong><br><br>${analysis}`;

  // Сохраняем результаты в localStorage
  localStorage.setItem(activeTest.title, JSON.stringify({score, stressLevel, answered, date:new Date().toLocaleString()}));

  goToRoom('result');
}
