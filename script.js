document.addEventListener('DOMContentLoaded', () => {
    const timerElement = document.getElementById('timer');
    let timeElapsed = 0;
    let timerInterval;

    // Timer startet bei 00:00
    function startTimer() {
        timerInterval = setInterval(() => {
            timeElapsed++;
            const minutes = Math.floor(timeElapsed / 60);
            const seconds = timeElapsed % 60;
            timerElement.innerText = `${formatTime(minutes)}:${formatTime(seconds)}`;
        }, 1000);
    }

    // Timer stoppen
    function stopTimer() {
        clearInterval(timerInterval);
    }

    // Formatierung der Zeit (immer zweistellig)
    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    // Timer beim Start des Quiz aufrufen
    startTimer();

    const questionContainerElement = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const nextButton = document.getElementById('next-button');
    const resultContainer = document.createElement('div');
    resultContainer.id = 'result-container';
    resultContainer.classList.add('hide'); // Verstecke das Ergebnis am Anfang
    document.body.appendChild(resultContainer);

    const restartButton = document.getElementById('restart-button');

    let shuffledQuestions, currentQuestionIndex;
    let correctAnswersCount = 0;
    const totalQuestions = 20;
    let correctAnswersNeeded = 0;

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < shuffledQuestions.length) {
            setNextQuestion();
        } else {
            showResult();
        }
    });

    restartButton.addEventListener('click', () => {
        restartQuiz();
    });

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            shuffledQuestions = shuffle(data).slice(0, totalQuestions);
            currentQuestionIndex = 0;
            setNextQuestion();
        });

    function setNextQuestion() {
        resetState();
        showQuestion(shuffledQuestions[currentQuestionIndex]);
        const progressElement = document.getElementById('progress');
        progressElement.innerText = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
    }

    function showQuestion(question) {
        questionElement.innerText = question.question;

        // Zähle die korrekten Antworten für die aktuelle Frage
        correctAnswersNeeded = question.answers.filter(answer => answer.correct).length;

        if (correctAnswersNeeded > 1) {
            questionElement.innerText += ` (Multiple Choice - Choose ${correctAnswersNeeded} Answers)`;
        }

        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn');
            button.dataset.correct = answer.correct;
            button.addEventListener('click', selectAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    function resetState() {
        nextButton.classList.add('hide');
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
        clearStatusClass(document.body);
    }

    function selectAnswer(e) {
        const selectedButton = e.target;
        selectedButton.classList.add('selected-highlight'); // Füge die Hervorhebung hinzu
        selectedButton.classList.add('selected'); // Markiere die Antwort als ausgewählt

        // Entferne die Hervorhebung nach kurzer Zeit (z.B. nach 500ms)
        setTimeout(() => {
        selectedButton.classList.remove('selected-highlight');
        }, 10000);

        const selectedButtons = Array.from(answerButtonsElement.children).filter(button => button.classList.contains('selected'));

        if (selectedButtons.length === correctAnswersNeeded) {
            let allCorrect = true;
            selectedButtons.forEach(button => {
                if (button.dataset.correct !== 'true') {
                    allCorrect = false;
                }
            });

            if (allCorrect) {
                correctAnswersCount++;
            } else {
            }

            // Deaktiviere alle Buttons nach Auswahl
            Array.from(answerButtonsElement.children).forEach(button => {
                button.disabled = true;
                setStatusClass(button, button.dataset.correct === 'true');
            });

            nextButton.classList.remove('hide');
        }
    }

    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showResult() {
        questionContainerElement.classList.add('hide'); // Fragen-Container ausblenden
        resultContainer.innerText = `You have answered ${correctAnswersCount} out of ${totalQuestions} questions correctly! `;
        resultContainer.classList.remove('hide'); // Ergebnis anzeigen
        restartButton.classList.remove('hide'); // Restart-Button sichtbar machen
        nextButton.classList.add('hide'); // "Next"-Button ausblenden
    }

    function restartQuiz() {
        correctAnswersCount = 0;
        shuffledQuestions = shuffle(shuffledQuestions); // Fragen neu mischen
        currentQuestionIndex = 0;
        resultContainer.classList.add('hide'); // Ergebnis verstecken
        restartButton.classList.add('hide'); // Restart-Button verstecken
        questionContainerElement.classList.remove('hide'); // Fragen-Container wieder anzeigen
        setNextQuestion();
    
        stopTimer(); // Timer stoppen
        timeElapsed = 0; // Timer zurücksetzen
        startTimer(); // Timer neu starten
    }
});
