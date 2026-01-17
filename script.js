function goToRoom(id){
  document.querySelectorAll('.room').forEach(r=>r.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Пользователь
document.getElementById('userForm').addEventListener('submit', e=>{
  e.preventDefault();
  localStorage.setItem('user', JSON.stringify({
    name:name.value, age:age.value
  }));
  goToRoom('tests');
});

// Web Audio API для звука
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
function playTick(){const o=audioCtx.createOscillator();o.frequency.value=1000;o.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+0.05);}
function playHeart(){const o=audioCtx.createOscillator();o.frequency.value=80;o.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+0.2);}

// Тесты
let current=0, score=0, answered=0, time=10, timer, stressLevel=0, activeTest;

const tests = {
  logic:{title:"ЛОГИКА", questions:[
    {q:"Информация противоречива?", a:[["Проверяю",3],["Верю",1],["Игнорирую",0]]},
    {q:"Сложная задача?", a:[["Делю на части",3],["Импровизирую",1],["Бросаю",0]]},
    {q:"Ошибка — это?", a:[["Опыт",3],["Провал",0],["Случайность",1]]},
    {q:"Неочевидное решение?", a:[["Анализирую",3],["Интуиция",1],["Пауза",0]]},
    {q:"Ты думаешь о?", a:[["Последствиях",3],["Сейчас",1],["Редко",0]]}
  ]},
  drive:{title:"СТРЕМЛЕНИЕ", questions:[
    {q:"Сложная цель?", a:[["Иду до конца",3],["Пробую",1],["Сдаюсь",0]]},
    {q:"Нет мотивации?", a:[["Дисциплина",3],["Жду",1],["Бросаю",0]]},
    {q:"Ты чаще?", a:[["Завершаю",3],["Начинаю",1],["Бросаю",0]]},
    {q:"Неудача?", a:[["Временная",3],["Сбивает",1],["Конец",0]]},
    {q:"Контроль?", a:[["Сам",3],["Сложно",1],["Нет",0]]}
  ]},
  choice:{title:"ВЫБОР", questions:[
    {q:"Под давлением?", a:[["Хладнокровен",3],["Импульсивен",1],["Паникую",0]]},
    {q:"Ошибка?", a:[["Принимаю",3],["Оправдания",1],["Избегаю",0]]},
    {q:"Риск?", a:[["Осознанный",3],["Интуитивный",1],["Избегаю",0]]},
    {q:"Сложный путь?", a:[["Выбираю",3],["Иногда",1],["Нет",0]]},
    {q:"Последствия?", a:[["Принимаю",3],["Откладываю",1],["Боюсь",0]]}
  ]},
  dark:{title:"DARK ROOM", questions:[
    {q:"Спасёшь одного ценой пяти?", a:[["Да",3],["Нет",1],["Не решу",0]]},
    {q:"Скажешь правду?", a:[["Да",3],["Нет",1],["Промолчу",0]]},
    {q:"Цель оправдывает средства?", a:[["Иногда",3],["Нет",1],["Да",0]]},
    {q:"Пожертвуешь собой?", a:[["Да",3],["Зависит",1],["Нет",0]]},
    {q:"Мораль абсолютна?", a:[["Нет",3],["Иногда",1],["Да",0]]}
  ]},
  silence:{title:"РЕЖИМ ТИШИНЫ", questions:[
    {q:"Ты наблюдаешь мысли?", a:[["Да",3],["Иногда",1],["Нет",0]]},
    {q:"Сосредоточен на ощущениях?", a:[["Да",3],["Частично",1],["Нет",0]]},
    {q:"Следишь за дыханием?", a:[["Да",3],["Иногда",1],["Нет",0]]},
    {q:"Внутренний шум?", a:[["Минимальный",3],["Средний",1],["Высокий",0]]},
    {q:"Ощущение времени?", a:[["Контроль",3],["Сжатие",1],["Потеря",0]]}
  ]}
};

function startTest(type){
  activeTest=tests[type]; current=0; score=0; answered=0; stressLevel=0;
  applyStress(); document.getElementById('testTitle').innerText=activeTest.title;
  goToRoom('test'); showQuestion();
}

function applyStress(){document.body.className=stressLevel===0?"stress-low":stressLevel===1?"stress-mid":"stress-high";}

function showQuestion(){
  resetTimer();
  const q=activeTest.questions[current];
  const qEl=document.getElementById('question'); qEl.classList.remove('fade'); void qEl.offsetWidth; qEl.classList.add('fade'); qEl.innerText=q.q;

  const aEl=document.getElementById('answers'); aEl.innerHTML="";
  q.a.forEach(([t,p])=>{
    const b=document.createElement('button'); b.innerText=t;
    b.onclick=()=>{score+=p; answered++; next();}; aEl.appendChild(b);
  });
}

function resetTimer(){
  clearInterval(timer); time=stressLevel===2?5:stressLevel===1?7:10;
  timer=setInterval(()=>{
    time--; document.getElementById('timer').innerText="⏳ "+time;
    if(time<=3){ playTick(); playHeart(); }
    if(time<=0){ stressLevel++; applyStress(); next(); }
  },1000);
}

function next(){ clearInterval(timer); current++; current<5 ? showQuestion() : showResult(); }

function showResult(){
  clearInterval(timer);
  let state, analysis;
  if(answered===0){ 
    state="ПЕРЕГРУЗКА"; 
    analysis=`Ты не выбрал ни одного варианта. Это указывает на высокую пассивность и потенциально тяжелые дни впереди.`;
  } else if(stressLevel<=1 && score>=12){ state="КОНТРОЛЬ"; analysis=`Ты сохранил ясность мышления под давлением. Ты анализируешь информацию, не теряя самообладания. В стрессовой среде ты склонен опираться на факты, а не на эмоции.`; }
  else if(score>=7){ state="НАПРЯЖЕНИЕ"; analysis=`Давление начало влиять на мышление. Решения стали быстрее, но менее глубокими. Ты способен действовать, но риск ошибок возрастает.`; }
  else { state="ПЕРЕГРУЗКА"; analysis=`Стресс сузил мышление. Решения принимались импульсивно или автоматически. Осознание этого — первый шаг к контролю.`; }

  document.getElementById('resultText').innerHTML=`<strong>Состояние: ${state}</strong><br><br>${analysis}`;
  localStorage.setItem(activeTest.title, JSON.stringify({score, stressLevel, answered, date:new Date().toLocaleString()}));
  goToRoom('result');
}

const darkImg = document.querySelector('.dark_image img');

document.addEventListener('mousemove', (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 40; // горизонт
  const y = (window.innerHeight / 2 - e.clientY) / 40; // вертикаль
  darkImg.style.transform = `rotateY(${x}deg) rotateX(${y}deg) scale(1.05)`;
});

document.addEventListener('mouseleave', () => {
  darkImg.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1.05)';
});
