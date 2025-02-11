let correctAnswer;
let timeLeft = 10;
let timerInterval;
let isTimerOn = false;
let translations = {};
let currentLang = 'se'; 

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

    document.getElementById('answerInput').style.display = 'inline-block';

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

    document.getElementById('operator').innerText = operatorText;

    document.getElementById('answerInput').value = '';
    document.getElementById('message').innerText = '';

    if (inputPosition === 0) {
        document.getElementById('operator').before(document.getElementById('answerInput'));
    } else if (inputPosition === 1) {
        document.getElementById('rightPart').before(document.getElementById('answerInput'));
    } else {
        document.getElementById('result').before(document.getElementById('answerInput'));
    }

    // Auto-focus the input field after generating a new question
    document.getElementById('answerInput').focus();

    if (isTimerOn) {
        resetTimer(); // Reset and start the timer for the new question
    } else {
        clearInterval(timerInterval);
        document.getElementById('timeleft').innerText = ''
        document.getElementById('timer').innerText = '';
    }
}

function populateCalculation(left, right, answer) {
    document.getElementById('leftPart').innerText = left;
    document.getElementById('rightPart').innerText = right;
    document.getElementById('result').innerText = answer;
}

function checkAnswer() {
    const userAnswer = document.getElementById('answerInput').value.trim();
    const parsedAnswer = parseInt(userAnswer, 10); // Convert the input to an integer

    if (userAnswer === "" || isNaN(parsedAnswer)) {
        showModal(t('answerModalError'), false);
    } else if (parsedAnswer === correctAnswer) {
        showModal(t('answerModalSuccess'), true);
        updateScore();
        clearInterval(timerInterval);
        setTimeout(generateQuestion, 1000); // Wait 1 second before showing a new question
    } else {
        showModal(t('answerModalFailure'), false);
    }
}

function checkIfPlayerExists(player) {
    const checkPlayer = JSON.parse(sessionStorage.getItem(player))
    // check if player exists
}

function getScore() {
    const player = JSON.parse(sessionStorage.getItem('player'))
    player !== null ? document.getElementById("score").innerText = player.score : '0' 
}

function updateScore() {
    let updatePlayer = JSON.parse(sessionStorage.getItem('player'));
    updatePlayer.score++;
    sessionStorage.setItem('player', JSON.stringify(updatePlayer));
    document.getElementById("score").innerText = updatePlayer.score
}

function startTimer() {
    timerInterval = setInterval(function () {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('message').innerText = t('timerTimesUp');
            setTimeout(generateQuestion, 1000); // Wait 1 second before showing a new question
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 10;
    document.getElementById('timeleft').innerText = t('timerTimeLeft');
    document.getElementById('timer').innerText = timeLeft;
    startTimer();
}

function toggleTimer() {
    isTimerOn = !isTimerOn;
    if (isTimerOn) {
        document.getElementById('toggleTimerBtn').innerText = t('timerStop');
        document.getElementById('timer').innerText = timeLeft;
        resetTimer();
    } else {
        document.getElementById('toggleTimerBtn').innerText = t('timerStart');
        clearInterval(timerInterval);
        document.getElementById('timer').innerText = ''; // Hide the timer display
    }
}

function initModal() {
    let modal = document.getElementById("nameModal");
    let openBtn = document.getElementById("openModalBtn");
    let closeBtn = document.getElementById("closeModal");
    let submitBtn = document.getElementById("submitName");

    if (JSON.parse(sessionStorage.getItem('player') === null)) {
        modal.style.display = "block";
    }

    // Open modal
    openBtn.onclick = function () {
        modal.style.display = "block";
    };

    // Close modal
    closeBtn.onclick = function () {
        modal.style.display = "none";
    };

    // Close modal if clicking outside of modal content
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Submit name and store in session storage
    submitBtn.onclick = function () {
        let name = document.getElementById("nameInput").value;
        if (name.trim() !== "") {
            console.log(Object.entries(sessionStorage))
            const player = new Player(name, 0)
            // check if player exists in local storgae
            // if exists -> load player (?) and close modal and somehow pass on the name to other functions
            // if not exists -> setItem with players name
            sessionStorage.setItem('player', JSON.stringify(player));
            document.getElementById("displayName").innerText = player.name;
            document.getElementById('score').innerText = player.score;
            modal.style.display = "none"; // Close modal
        } else {
            alert(t('modalAlert'));
        }
    };
}

function showModal(message, isSuccess) {
    const modal = document.getElementById('resultModal');
    const modalText = document.getElementById('modalText');

    // Set modal message
    modalText.innerText = message;

    // Add class based on success or failure (optional for styling)
    if (isSuccess) {
        modal.classList.add('success');
        modal.classList.remove('failure');
    } else {
        modal.classList.add('failure');
        modal.classList.remove('success');
    }

    // Show modal
    modal.style.display = 'block';

    // Hide modal after 2 seconds
    setTimeout(() => {
        modal.style.display = 'none';
    }, 1000);
}

// Function to load name from session storage on page load
function loadStoredName() {
    let storedName = JSON.parse(sessionStorage.getItem("player"));
    if (storedName !== null) {
        document.getElementById("displayName").innerText = storedName.name;
    }
}

function loadExternalTexts() {
    document.getElementById('headline').innerText = t('title');
    document.getElementById('newPlayer').innerText = t('newPlayer');
    document.getElementById('toggleTimerBtn').innerText = t('timerStart');
    document.getElementById('submitBtn').innerText = t('submitButton')
    document.getElementById('modalHeadLine').innerText = t('modalHeadLine')
    document.getElementById('submitName').innerText = t('modalSubmitName')
    document.getElementById('closeModal').innerText = t('modalClose')
    document.getElementById('displayNameScore').innerText = t('displayNameScore')
}

// Detect "Enter" key press and trigger submit when pressed
document.getElementById('answerInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitBtn').click(); // Simulate submit button click
    }
});

window.onload = function() {
    //console.log(Object.entries(sessionStorage))
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
