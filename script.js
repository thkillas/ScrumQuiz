document.addEventListener('DOMContentLoaded', () => {
    const questionContainerElement = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const nextButton = document.getElementById('next-button');
    const resultContainer = document.createElement('div');
    resultContainer.id = 'result-container';
    resultContainer.classList.add('hide'); // Verstecke das Ergebnis am Anfang
    document.body.appendChild(resultContainer);

    const restartButton = document.createElement('button');
    restartButton.innerText = 'Neu Starten';
    restartButton.classList.add('hide', 'btn');
    document.body.appendChild(restartButton);

    let shuffledQuestions, currentQuestionIndex;
    let correctAnswersCount = 0;
    const totalQuestions = 15;
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
    }

    function showQuestion(question) {
        questionElement.innerText = question.question;

        // Zähle die korrekten Antworten für die aktuelle Frage
        correctAnswersNeeded = question.answers.filter(answer => answer.correct).length;

        if (correctAnswersNeeded > 1) {
            questionElement.innerText += ` (Mehrfachauswahl - Wähle ${correctAnswersNeeded} Antworten)`;
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
        selectedButton.classList.add('selected');

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
                //setStatusClass(document.body, true);
            } else {
                //setStatusClass(document.body, false);
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
        questionContainerElement.classList.add('hide');
        resultContainer.innerText = `Du hast ${correctAnswersCount} von ${totalQuestions} Fragen richtig beantwortet!`;
        resultContainer.classList.remove('hide');
        nextButton.classList.add('hide'); // Verstecke den Weiter-Button, wenn das Ergebnis angezeigt wird
        restartButton.classList.remove('hide'); // Zeige den Neu Starten-Button an
    }

    function restartQuiz() {
        correctAnswersCount = 0;
        shuffledQuestions = shuffle(shuffledQuestions);
        currentQuestionIndex = 0;
        resultContainer.classList.add('hide');
        restartButton.classList.add('hide');
        questionContainerElement.classList.remove('hide');
        setNextQuestion();
    }
});
