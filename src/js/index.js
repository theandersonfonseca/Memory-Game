const getElement = (el) => document.querySelector(el);

const gameContainer = getElement('[data-GameContainer]');
const selectInput = getElement('[data-select]');
const startBtn = getElement('[data-start]');
const homeBtn = getElement('[data-home]');
const timeBtn = getElement('[data-time]');

const modal = getElement('[data-modal]');
const modalContainer = getElement('[data-modalContainer]');

let firstCard, secondCard, timer, isBestResult;

const getResultsFromLocalStorage = (currentDifficulty) => {
  let results = [];

  if (localStorage.hasOwnProperty(currentDifficulty)) {
    results = JSON.parse(localStorage.getItem(currentDifficulty));
  }

  return results;
};

const saveResultInLocalStorage = (finalTime, currentDifficulty) => {
  const results = [...getResultsFromLocalStorage(currentDifficulty), finalTime];

  localStorage.setItem(currentDifficulty, JSON.stringify(results));
};

const convertTimesToNumbers = (results) => {
  const numbersArr = [];

  results.forEach((el) => {
    const timeArr = el.split(':');
    const secondsToMinutes = +timeArr[1] / 60;
    const number = +timeArr[0] + secondsToMinutes;

    numbersArr.push(number);
  });

  return numbersArr;
};

const getBestResult = (currentDifficulty) => {
  const results = getResultsFromLocalStorage(currentDifficulty);

  const numbers = convertTimesToNumbers(results);
  const minNumber = Math.min(...numbers);
  const bestResult = results[numbers.indexOf(minNumber)];

  bestResult === timeBtn.innerHTML
    ? (isBestResult = true)
    : (isBestResult = false);

  return bestResult || timeBtn.innerHTML;
};

const closeModal = (e) => {
  if (e.target.classList.contains('modal__close')) {
    modal.classList.remove('modal--active');
    goToHome();
  }
};

const chooseModalText = (bestResult) => {
  const modalTexts = {
    notRecord: `o recorde para
                  esse nível é <span class="modal__text--time">${bestResult}</span>
                  😄`,

    newRecord: `parabéns, você bateu o recorde desse nível 🔥🔥🔥`,
  };

  const text = isBestResult ? modalTexts.newRecord : modalTexts.notRecord;

  return text;
};

const createModalText = (finalTime, currentDifficulty) => {
  const bestResult = getBestResult(currentDifficulty);

  const el = document.createElement('span');
  el.classList.add('modal__text');

  el.innerHTML = `<h2 class="modal__title">✨ Finalizado!!! ✨</h2>
                    <span class="modal__text">Seu tempo final foi
                    <span class="modal__text--time">${finalTime}</span>, 
                    ${chooseModalText(bestResult)}</span>
                    <i class="modal__close fas fa-times"></i>`;

  return el;
};

const showModal = (finalTime, currentDifficulty) => {
  modalContainer.innerHTML = '';
  modalContainer.appendChild(createModalText(finalTime, currentDifficulty));

  modal.classList.add('modal--active');

  modal.addEventListener('click', closeModal);
};

const finishGame = () => {
  clearInterval(timer);

  const finalTime = timeBtn.innerHTML;
  const currentDifficulty = selectInput.value;

  saveResultInLocalStorage(finalTime, currentDifficulty);
  showModal(finalTime, currentDifficulty);
};

const handleCardClickEvent = (addOrRemove, card) => {
  addOrRemove === 'add'
    ? card.addEventListener('click', handleClickOnCard)
    : card.removeEventListener('click', handleClickOnCard);
};

const getCards = () => [...document.querySelectorAll('[data-card]')];

const lockMatchedCards = () => {
  const notMatchedCards = [...getCards()].filter(
    (card) => !card.classList.contains('matched')
  );

  notMatchedCards.forEach((card) => {
    handleCardClickEvent('add', card);
  });

  if (notMatchedCards.length === 0) finishGame();
};

const checkForCardMatch = () => {
  if (firstCard.dataset.card === secondCard.dataset.card) {
    [firstCard, secondCard].forEach((card) => {
      handleCardClickEvent('remove', card);
      card.classList.add('matched');
    });
  } else {
    [firstCard, secondCard].forEach((card) =>
      card.classList.remove('memory-game__card--selected')
    );
  }

  firstCard = null;
  secondCard = null;

  lockMatchedCards();
};

const handleClickOnCard = (e) => {
  const target = e.currentTarget;

  handleCardClickEvent('remove', target);

  target.classList.add('memory-game__card--selected');

  !firstCard ? (firstCard = target) : (secondCard = target);

  if (firstCard && secondCard) {
    getCards().forEach((card) => {
      handleCardClickEvent('remove', card);
    });

    setTimeout(() => checkForCardMatch(), 500);
  }
};

const shuffleCards = (totalCards) => {
  getCards().forEach((card) => {
    const randomNumber = Math.floor(Math.random() * totalCards);
    card.style.order = randomNumber;
  });
};

const isCountryRepeated = (countriesPaths, countryPath) =>
  countriesPaths.includes(countryPath);

const getCountriesFromDirectory = (maxCountries) => {
  const countriesPaths = [];
  const totalCountriesAvailable = 250;

  while (countriesPaths.length < maxCountries) {
    const randomIndex = Math.floor(Math.random() * totalCountriesAvailable) + 1;

    const countryPath = `./img/country (${randomIndex}).png`;

    if (isCountryRepeated(countriesPaths, countryPath)) continue;

    countriesPaths.push(countryPath);
  }

  return [...countriesPaths, ...countriesPaths];
};

const generateCards = (countriesQuantity = 12) => {
  gameContainer.innerHTML = '';

  const totalCards = countriesQuantity * 2;
  const countriesPaths = getCountriesFromDirectory(countriesQuantity);

  for (let i = 0; i < totalCards; i++) {
    const el = document.createElement('div');
    el.setAttribute('data-card', `${countriesPaths[i]}`);
    el.classList.add('memory-game__card');

    el.innerHTML = `<img class="memory-game__back" src="./img/earth.png"/>
                      <img
                        class="memory-game__img memory-game__front"
                        src="${countriesPaths[i]}"
                      />
                      `;

    gameContainer.appendChild(el);
  }

  shuffleCards(totalCards);
};

const startTimer = () => {
  let seconds = 0;
  let minutes = 0;

  timer = setInterval(() => {
    seconds++;

    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }

    const configSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const configMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    timeBtn.innerHTML = `${configMinutes}:${configSeconds}`;
  }, 1000);
};

const startGame = () => {
  startTimer();
  handleBtnsDisplay(true);

  getCards().forEach((card) => {
    handleCardClickEvent('add', card);
  });
};

const setDifficulty = (difficulty = 'easy') => {
  const easyDifficultyCountriesQuantity = 12;
  const mediumDifficultyCountriesQuantity = 20;
  const hardDifficultyCountriesQuantity = 30;

  switch (difficulty) {
    case 'medium':
      gameContainer.classList.add('memory-game__medium');
      generateCards(mediumDifficultyCountriesQuantity);
      break;
    case 'hard':
      gameContainer.classList.add('memory-game__hard');
      generateCards(hardDifficultyCountriesQuantity);
      break;
    default:
      gameContainer.classList.add('memory-game__easy');
      generateCards(easyDifficultyCountriesQuantity);
      break;
  }
};

const removeDifficultyClasses = () => {
  gameContainer.classList.remove(
    'memory-game__easy',
    'memory-game__medium',
    'memory-game__hard'
  );
};

const handleBtnsDisplay = (isStarted) => {
  const displayHomeBtnsValue = isStarted ? 'none' : 'block';
  const displayStartButtonsValue = isStarted ? 'block' : 'none';

  [selectInput, startBtn].forEach(
    (btn) => (btn.style.display = displayHomeBtnsValue)
  );

  [homeBtn, timeBtn].forEach(
    (btn) => (btn.style.display = displayStartButtonsValue)
  );
};

const resetGame = () => {
  clearInterval(timer);
  timeBtn.innerHTML = '00:00';
  selectInput.value = 'easy';
};

const goToHome = () => {
  resetGame();
  handleBtnsDisplay(false);
  removeDifficultyClasses();
  setDifficulty();
};

const handleControls = () => {
  selectInput.addEventListener('change', (e) => {
    removeDifficultyClasses();
    setDifficulty(e.target.value);
  });

  startBtn.addEventListener('click', startGame);
  homeBtn.addEventListener('click', goToHome);
};

generateCards();
handleControls();
