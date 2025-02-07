let correctAnswer;
    let score = sessionStorage.getItem("score");
    let timeLeft = 10;
    let timerInterval;
    let isTimerOn = false;  // Timer is off by default

    function getScore() {
        score = sessionStorage.getItem("score")
        document.getElementById("score").innerText = score
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
            document.getElementById('leftPart').innerText = '';
            document.getElementById('rightPart').innerText = rightPartText;
            document.getElementById('result').innerText = result;
        } else if (inputPosition === 1) {
            // Input replaces the second operand
            leftPartText = num1;
            correctAnswer = num2;
            document.getElementById('leftPart').innerText = leftPartText;
            document.getElementById('rightPart').innerText = '';
            document.getElementById('result').innerText = result;
        } else {
            // Input replaces the result
            leftPartText = num1;
            rightPartText = num2;
            correctAnswer = result;
            document.getElementById('leftPart').innerText = leftPartText;
            document.getElementById('rightPart').innerText = rightPartText;
            document.getElementById('result').innerText = '';
        }

        document.getElementById('operator').innerText = operatorText;

        document.getElementById('answerInput').value = '';
        document.getElementById('message').innerText = '';
        document.getElementById('correctMessage').innerText = ''; // Clear the "Correct!" message

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

    function checkAnswer() {
        const userAnswer = document.getElementById('answerInput').value.trim();
        const parsedAnswer = parseInt(userAnswer, 10); // Convert the input to an integer

        if (userAnswer === "" || isNaN(parsedAnswer)) {
            document.getElementById('message').innerText = 'Vänligen ange en siffra...';
        } else if (parsedAnswer === correctAnswer) {
            document.getElementById('correctMessage').innerText = 'Rätt svar! 😊🤩';
            score++;
            sessionStorage.setItem("score", score);
            document.getElementById('score').innerText = sessionStorage.getItem("score");
            clearInterval(timerInterval);
            setTimeout(generateQuestion, 1000); // Wait 1 second before showing a new question
        } else {
            document.getElementById('message').innerText = 'Prova igen! 🤗';
        }
    }

    function startTimer() {
        timerInterval = setInterval(function () {
            timeLeft--;
            document.getElementById('timer').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                document.getElementById('message').innerText = "Tiden är ute!";
                setTimeout(generateQuestion, 1000); // Wait 1 second before showing a new question
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = 10;
        document.getElementById('timeleft').innerText = 'Tid kvar: '
        document.getElementById('timer').innerText = timeLeft;
        startTimer();
    }

    function toggleTimer() {
        isTimerOn = !isTimerOn;
        if (isTimerOn) {
            document.getElementById('toggleTimerBtn').innerText = "Stoppa timer";
            document.getElementById('timer').innerText = timeLeft;
            resetTimer();
        } else {
            document.getElementById('toggleTimerBtn').innerText = "Starta timer";
            clearInterval(timerInterval);
            document.getElementById('timer').innerText = ''; // Hide the timer display
        }
    }

    // Detect "Enter" key press and trigger submit when pressed
    document.getElementById('answerInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('submitBtn').click(); // Simulate submit button click
        }
    });

    window.onload = function() {
        getScore();
        generateQuestion();
    };