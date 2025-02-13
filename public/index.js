let correctAnswer;
let timeLeft = 10;
let timerInterval;
let isTimerOn = false;
let translations = {};
let currentLang = 'se'; 
const ACTIVE_PLAYER = 'activePlayer'

// Function to load the selected language file
function loadTranslations(lang) {
    fetch(`translations/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            translations = data;
            currentLang = lang;
            loadExternalTexts();
        })
        .catch(error => console.error('Error loading translations:', error));
}

// Function to get translated text
function t(key) {
    return translations[key] || key; // Fallback to key if missing
}

// Function to switch language
function changeLanguage(lang) {
    if (lang !== currentLang) {
        loadTranslations(lang);
    }
}

function generateQuestion() {
    let num1 = Math.floor(Math.random() * 10) + 1; // Random number from 1 to 10
    let num2 = Math.floor(Math.random() * 10) + 1; // Random number from 1 to 10
    const isAddition = Math.random() > 0.5;
    const inputPosition = Math.floor(Math.random() * 3); // 0: first operand, 1: second operand, 2: result

    let leftPartText = '', rightPartText = '', operatorText, result;

    // Ensure result is always >= 1
    if (isAddition) {
        operatorText = ' + ';
        result = num1 + num2;
    } else {
        operatorText = ' - ';
        // Make sure the result of subtraction is always positive
        if (num1 < num2) {
            [num1, num2] = [num2, num1]; // Swap num1 and num2 if num1 < num2 to avoid negative results
        }
        result = num1 - num2;
    }

    getElement('answerInput').style.display = 'inline-block';

    // Determine where to place the input field
    if (inputPosition === 0) {
        // Input replaces the first operand
        correctAnswer = num1;
        rightPartText = num2;
        populateCalculation('', rightPartText, result)
    } else if (inputPosition === 1) {
        // Input replaces the second operand
        leftPartText = num1;
        correctAnswer = num2;
        populateCalculation(leftPartText, '', result)
    } else {
        // Input replaces the result
        leftPartText = num1;
        rightPartText = num2;
        correctAnswer = result;
        populateCalculation(leftPartText, rightPartText, '')
    }

    getElement('operator').innerText = operatorText;

    getElement('answerInput').value = '';
    getElement('message').innerText = '';

    if (inputPosition === 0) {
        getElement('operator').before(getElement('answerInput'));
    } else if (inputPosition === 1) {
        getElement('rightPart').before(getElement('answerInput'));
    } else {
        getElement('result').before(getElement('answerInput'));
    }

    // Auto-focus the input field after generating a new question
    getElement('answerInput').focus();

    if (isTimerOn) {
        resetTimer(); // Reset and start the timer for the new question
    } else {
        clearInterval(timerInterval);
        getElement('timeleft').innerText = ''
        getElement('timer').innerText = '';
    }
}

function populateCalculation(left, right, answer) {
    getElement('leftPart').innerText = left;
    getElement('rightPart').innerText = right;
    getElement('result').innerText = answer;
}

function checkAnswer() {
    let numberOfTries = get('tries') !== null ? get('tries') : 1
    const userAnswer = getElement('answerInput').value.trim();
    const parsedAnswer = parseInt(userAnswer, 10); // Convert the input to an integer

    if (userAnswer === "" || isNaN(parsedAnswer)) {
        showModal(t('answerModalError'), false);
    } else if (parsedAnswer === correctAnswer) {
        showModal(t('answerModalSuccess'), true);
        updateScore();
        clearInterval(timerInterval);
        resetTries();
        setTimeout(generateQuestion, 1000); // Wait 1 second before showing a new question
    } else {
        if (numberOfTries < 3) {
            numberOfTries++;
            set('tries', numberOfTries)
            showModal(t('answerModalFailure'), false);
        } else {
            resetTries();
            showModal(t('answerModalFinalFailure'), false, correctAnswer);
            // enable new question
            generateQuestion()
        }
    }
}

function getScore() {
    const player = getObject('activePlayer');
    player !== null ? getElement("score").innerText = player.score : '0' 
}

function updateScore() {
    let updatePlayer = getObject('activePlayer')
    updatePlayer.score++;
    setObject(updatePlayer.name, updatePlayer);
    getElement("score").innerText = updatePlayer.score
}

function startTimer() {
    timerInterval = setInterval(function () {
        timeLeft--;
        getElement('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            getElement('message').innerText = t('timerTimesUp');
            setTimeout(generateQuestion, 1000); // Wait 1 second before showing a new question
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 10;
    getElement('timeleft').innerText = t('timerTimeLeft');
    getElement('timer').innerText = timeLeft;
    startTimer();
}

function toggleTimer() {
    isTimerOn = !isTimerOn;
    if (isTimerOn) {
        getElement('toggleTimerBtn').innerText = t('timerStop');
        getElement('timer').innerText = timeLeft;
        resetTimer();
    } else {
        getElement('toggleTimerBtn').innerText = t('timerStart');
        clearInterval(timerInterval);
        getElement('timer').innerText = ''; // Hide the timer display
    }
}

function initModal() {
    let modal = getElement("nameModal");
    let openBtn = getElement("openModalBtn");
    let closeBtn = getElement("closeModal");
    let submitBtn = getElement("submitName");

    if (get('activePlayer') === null) {
        modal.style.display = "block";
    }

    // Open modal
    openBtn.onclick = function () {
        modal.style.display = "block";
        getElement("nameInput").value = ''

        // Wait a short time before focusing to ensure it's visible
        setTimeout(() => {
            getElement("nameInput").focus();
        }, 50); 
    };

    // Close modal
    closeBtn.onclick = function () {
        modal.style.display = "none";
    };

    // Close modal if clicking outside of modal content
    window.onclick = function (event) {
        if (event.target === modal && getElement("nameInput").value !== '') {
            modal.style.display = "none";
        }
    };

    // Submit name and store in session storage
    submitBtn.onclick = function () {
        let name = getElement("nameInput").value;
        if (name.trim() !== "") {
            let player;
            const playerExists = Object.entries(sessionStorage).some(([key, value]) => {
                try {
                    const storedPlayer = JSON.parse(value);
                    if (storedPlayer.name !== null || storedPlayer.name !== undefined) {
                        return storedPlayer.name === name;
                    }
                } catch (e) {
                    return false; // Skip invalid JSON entries
                }
            });

            if (playerExists) {
                player = get(name)
                activePlayer(name)
            } else {
                player = new Player(name, 0)
                setObject(name, player);
                activePlayer(name)
            }

            resetTries();
            getElement("displayName").innerText = player.name;
            getElement('score').innerText = player.score;
            modal.style.display = "none"; // Close modal
        } else {
            alert(t('modalAlert'));
        }
    };
}

function activePlayer(playerName) {
    if (playerName == null || playerName == undefined) {
        return get('activePlayer');
    } else {
        setObject('activePlayer', playerName);
    }

}

function resetTries() {
    set('tries', 1);
}

function showModal(message, isSuccess, correctAnswer) {
    const modal = getElement('resultModal');
    const modalText = getElement('modalText');
    let timeout = 1000;

    // Set modal message
    modalText.innerText = message;

    // Add class based on success or failure (optional for styling)
    if (isSuccess) {
        modal.classList.add('success');
        modal.classList.remove('failure');
    } else if (!isSuccess && correctAnswer === undefined) {
        modal.classList.add('failure');
        modal.classList.remove('success');
    } else {
        modalText.innerText = modalText.innerText + `\n${correctAnswer}`;
        timeout = 1500;
        modal.classList.add('failure');
        modal.classList.remove('success');
    }

    // Show modal
    modal.style.display = 'block';

    // Hide modal after 2 seconds
    setTimeout(() => {
        modal.style.display = 'none';
    }, timeout);
}

function get(value) {
    return JSON.parse(sessionStorage.getItem(value));
}

function getObject(player) {
    const key = get(player);
    return JSON.parse(sessionStorage.getItem(key));
}

function set(key, value) {
    sessionStorage.setItem(key, value)
}

function setObject(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))
}

function getElement(element) {
    return document.getElementById(element);
}

// Function to load name from session storage on page load
function loadStoredName() {
    let storedName = getObject('activePlayer');
    if (storedName !== null) {
        getElement("displayName").innerText = storedName.name;
    }
}

function loadExternalTexts() {
    getElement('headline').innerText = t('title');
    getElement('newPlayer').innerText = t('newPlayer');
    getElement('toggleTimerBtn').innerText = t('timerStart');
    getElement('submitBtn').innerText = t('submitButton')
    getElement('modalHeadLine').innerText = t('modalHeadLine')
    getElement('submitName').innerText = t('modalSubmitName')
    getElement('closeModal').innerText = t('modalClose')
    getElement('displayNameScore').innerText = t('displayNameScore')
}

// Detect "Enter" key press and trigger submit when pressed
getElement('answerInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        getElement('submitBtn').click(); // Simulate submit button click
    }
});

window.addEventListener('resize', () => {
    const modal = getElement('modal-content');
    if (modal) {
        modal.style.top = `${window.innerHeight / 2}px`;
    }
});


window.onload = function() {
    loadTranslations(currentLang);
    initModal();
    loadStoredName();
    getScore();
    generateQuestion();
};

class Player {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
}
