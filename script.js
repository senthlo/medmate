class MedMateApp {
    constructor() {
        this.currentXP = 2500;
        this.currentLevel = 12;
        this.userType = 'nurse'; // 'nurse' or 'doctor'
        this.currentExam = null;
        this.initializeApp();
    }

    initializeApp() {
        this.initializeTabs();
        this.initializeUserType();
        this.initializeExamProgress();
        this.initializeTheory();
        this.initializeStations();
        this.initializeTasks();
        this.initializeQuickActions();
        this.updateStatsDisplay();
        
        // Load initial data based on user type
        this.updateContentForUserType();
    }

    initializeTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show target content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });

                this.showToast('Переход выполнен успешно!', 'success');
            });
        });
    }

    initializeUserType() {
        const userTypeSelect = document.getElementById('userType');
        userTypeSelect.addEventListener('change', (e) => {
            this.userType = e.target.value;
            this.updateContentForUserType();
            this.showToast(`Режим изменен: ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
    }

    updateContentForUserType() {
        // Update question counts and content based on user type
        const theoryCount = document.getElementById('theoryCount');
        const tasksCount = document.getElementById('tasksCount');
        
        if (this.userType === 'nurse') {
            theoryCount.textContent = '1200';
            tasksCount.textContent = '80';
            // Update other content specific to nurses
        } else {
            theoryCount.textContent = '1800';
            tasksCount.textContent = '150';
            // Update other content specific to doctors
        }
    }

    initializeExamProgress() {
        const startExamButtons = document.querySelectorAll('.start-exam');
        
        startExamButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const examType = e.target.closest('.exam-card').getAttribute('data-exam');
                this.startExamPreparation(examType);
            });
        });
    }

    startExamPreparation(examType) {
        this.currentExam = examType;
        
        // Update progress steps
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => step.classList.remove('active'));
        
        document.querySelector(`.step[data-step="${this.getStepNumber(examType)}"]`).classList.add('active');
        
        // Navigate to corresponding tab
        const targetTab = this.getTabForExam(examType);
        document.querySelector(`.tab[data-tab="${targetTab}"]`).click();
        
        this.showToast(`Начата подготовка к этапу: ${this.getExamName(examType)}`, 'success');
    }

    getStepNumber(examType) {
        const stepMap = {
            'theory': 1,
            'stations': 2,
            'tasks': 3
        };
        return stepMap[examType] || 1;
    }

    getTabForExam(examType) {
        const tabMap = {
            'theory': 'theory',
            'stations': 'stations',
            'tasks': 'tasks'
        };
        return tabMap[examType] || 'dashboard';
    }

    getExamName(examType) {
        const nameMap = {
            'theory': 'Тестирование',
            'stations': 'Практические станции',
            'tasks': 'Ситуационные задачи'
        };
        return nameMap[examType] || 'Подготовка';
    }

    initializeTheory() {
        this.initializeQuiz();
        this.initializeRandomTest();
    }

    initializeQuiz() {
        // Quiz state
        this.quizState = {
            currentQuestion: 0,
            score: 0,
            timer: null,
            timeLeft: 1800, // 30 minutes in seconds
            questions: this.getSampleQuestions()
        };

        // Start random test button
        document.getElementById('startRandomTest').addEventListener('click', () => {
            this.startRandomTest();
        });

        // Quiz navigation
        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('skipQuestion').addEventListener('click', () => {
            this.skipQuestion();
        });
    }

    getSampleQuestions() {
        return [
            {
                question: "Какой препарат является антидотом при отравлении парацетамолом?",
                options: [
                    { text: "Ацетилцистеин", correct: true },
                    { text: "Налоксон", correct: false },
                    { text: "Флумазенил", correct: false },
                    { text: "Протамин", correct: false }
                ],
                explanation: "Ацетилцистеин является антидотом при отравлении парацетамолом, так как восполняет запасы глутатиона в печени и предотвращает гепатотоксическое действие N-ацетил-p-бензохинонимина.",
                difficulty: "medium"
            },
            {
                question: "Какой первый шаг при проведении сердечно-лёгочной реанимации?",
                options: [
                    { text: "Проверить пульс на сонной артерии", correct: false },
                    { text: "Обеспечить проходимость дыхательных путей", correct: false },
                    { text: "Оценить безопасность места происшествия", correct: true },
                    { text: "Начать непрямой массаж сердца", correct: false }
                ],
                explanation: "Первым шагом всегда является оценка безопасности места происшествия для спасателя и пострадавшего.",
                difficulty: "easy"
            },
            {
                question: "При каком уровне SpO2 показана кислородотерапия у пациента с ХОБЛ?",
                options: [
                    { text: "Менее 90%", correct: false },
                    { text: "Менее 88%", correct: true },
                    { text: "Менее 85%", correct: false },
                    { text: "Менее 92%", correct: false }
                ],
                explanation: "У пациентов с ХОБЛ кислородотерапия показана при SpO2 менее 88% из-за риска гиперкапнии.",
                difficulty: "hard"
            }
        ];
    }

    startRandomTest() {
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.classList.remove('hidden');
        
        this.quizState.currentQuestion = 0;
        this.quizState.score = 0;
        this.quizState.timeLeft = 1800;
        
        this.startQuizTimer();
        this.displayQuestion();
        
        this.showToast('Тест начат! У вас 30 минут.', 'info');
    }

    startQuizTimer() {
        if (this.quizState.timer) {
            clearInterval(this.quizState.timer);
        }
        
        this.quizState.timer = setInterval(() => {
            this.quizState.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.quizState.timeLeft <= 0) {
                this.finishQuiz();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.quizState.timeLeft / 60);
        const seconds = this.quizState.timeLeft % 60;
        document.getElementById('quizTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    displayQuestion() {
        const question = this.quizState.questions[this.quizState.currentQuestion];
        const questionElement = document.getElementById('quizQuestion');
        const optionsElement = document.getElementById('quizOptions');
        const progressElement = document.getElementById('quizProgress');
        const currentQuestionElement = document.getElementById('currentQuestion');
        const totalQuestionsElement = document.getElementById('totalQuestions');
        const difficultyElement = document.querySelector('.difficulty');
        const explanationElement = document.getElementById('quizExplanation');
        const nextButton = document.getElementById('nextQuestion');

        // Update question info
        questionElement.textContent = question.question;
        currentQuestionElement.textContent = this.quizState.currentQuestion + 1;
        totalQuestionsElement.textContent = this.quizState.questions.length;
        
        // Update progress
        const progress = ((this.quizState.currentQuestion + 1) / this.quizState.questions.length) * 100;
        progressElement.style.width = `${progress}%`;
        
        // Update difficulty
        difficultyElement.textContent = this.getDifficultyText(question.difficulty);
        difficultyElement.className = `difficulty ${question.difficulty}`;
        
        // Clear previous options
        optionsElement.innerHTML = '';
        
        // Add new options
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option.text}</span>
            `;
            
            optionElement.addEventListener('click', () => {
                this.selectOption(optionElement, option.correct);
            });
            
            optionsElement.appendChild(optionElement);
        });
        
        // Reset UI state
        explanationElement.classList.add('hidden');
        nextButton.disabled = true;
        nextButton.textContent = 'Следующий вопрос';
    }

    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': 'Легко',
            'medium': 'Средняя',
            'hard': 'Сложная'
        };
        return difficultyMap[difficulty] || 'Средняя';
    }

    selectOption(optionElement, isCorrect) {
        const options = document.querySelectorAll('.option');
        const explanationElement = document.getElementById('quizExplanation');
        const nextButton = document.getElementById('nextQuestion');
        
        // Disable all options
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        
        // Mark selected option
        optionElement.classList.add('selected');
        
        if (isCorrect) {
            optionElement.classList.add('correct');
            this.quizState.score++;
            this.awardXP(10);
            this.showToast('Правильно! +10 XP', 'success');
        } else {
            optionElement.classList.add('wrong');
            // Highlight correct answer
            options.forEach((opt, index) => {
                if (this.quizState.questions[this.quizState.currentQuestion].options[index].correct) {
                    opt.classList.add('correct');
                }
            });
            this.showToast('Неверный ответ', 'error');
        }
        
        // Show explanation
        const explanation = this.quizState.questions[this.quizState.currentQuestion].explanation;
        explanationElement.querySelector('p').textContent = explanation;
        explanationElement.classList.remove('hidden');
        
        // Enable next button
        nextButton.disabled = false;
        
        // Change button text if last question
        if (this.quizState.currentQuestion === this.quizState.questions.length - 1) {
            nextButton.textContent = 'Завершить тест';
        }
    }

    nextQuestion() {
        this.quizState.currentQuestion++;
        
        if (this.quizState.currentQuestion < this.quizState.questions.length) {
            this.displayQuestion();
        } else {
            this.finishQuiz();
        }
    }

    skipQuestion() {
        this.showToast('Вопрос пропущен', 'info');
        this.nextQuestion();
    }

    finishQuiz() {
        if (this.quizState.timer) {
            clearInterval(this.quizState.timer);
        }
        
        const score = this.quizState.score;
        const total = this.quizState.questions.length;
        const percentage = Math.round((score / total) * 100);
        
        this.showToast(`Тест завершен! Результат: ${score}/${total} (${percentage}%)`, 'success');
        this.awardXP(score * 5);
        
        // Hide quiz container
        document.querySelector('.quiz-container').classList.add('hidden');
    }

    initializeRandomTest() {
        // Additional initialization for random test functionality
    }

    initializeStations() {
        this.initializeStationPractice();
        this.initializeChecklists();
    }

    initializeStationPractice() {
        const practiceButtons = document.querySelectorAll('.practice-station');
        const closeButton = document.getElementById('closePractice');
        const startTimerButton = document.getElementById('startTimer');
        const submitStationButton = document.getElementById('submitStation');
        
        practiceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const stationCard = e.target.closest('.station-card');
                const stationType = stationCard.getAttribute('data-station');
                this.openStationPractice(stationType);
            });
        });
        
        closeButton.addEventListener('click', () => {
            this.closeStationPractice();
        });
        
        startTimerButton.addEventListener('click', () => {
            this.startStationTimer();
        });
        
        submitStationButton.addEventListener('click', () => {
            this.submitStationPractice();
        });
    }

    openStationPractice(stationType) {
        const practiceContainer = document.getElementById('stationPractice');
        const stationName = document.getElementById('practiceStationName');
        const checklist = document.getElementById('stationChecklist');
        
        // Set station name
        const stationNames = {
            'cpr': 'СЛР - Сердечно-лёгочная реанимация',
            'emergency': 'Неотложная помощь',
            'examination': 'Физикальное обследование',
            'history': 'Сбор жалоб и анамнеза',
            'prevention': 'Профилактический осмотр'
        };
        
        stationName.textContent = stationNames[stationType] || 'Практическая станция';
        
        // Load checklist
        const checklistItems = this.getChecklistForStation(stationType);
        checklist.innerHTML = '';
        
        checklistItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'checklist-item';
            itemElement.innerHTML = `
                <input type="checkbox" id="check-${index}">
                <label for="check-${index}">${item}</label>
            `;
            
            const checkbox = itemElement.querySelector('input');
            checkbox.addEventListener('change', () => {
                this.updateStationScore();
            });
            
            checklist.appendChild(itemElement);
        });
        
        // Reset timer and score
        document.getElementById('stationTimer').textContent = '10:00';
        document.getElementById('stationScore').textContent = '0/25';
        
        // Show practice container
        practiceContainer.classList.remove('hidden');
    }

    getChecklistForStation(stationType) {
        const checklists = {
            'cpr': [
                "Оценить безопасность места происшествия",
                "Проверить сознание пациента",
                "Вызвать скорую помощь",
                "Открыть дыхательные пути",
                "Проверить дыхание в течение 10 секунд",
                "Начать компрессии грудной клетки (30:2)",
                "Проводить СЛР до прибытия помощи"
            ],
            'emergency': [
                "Быстрая оценка состояния пациента (ABCDE)",
                "Обеспечить проходимость дыхательных путей",
                "Оценить дыхание и оксигенацию",
                "Оценить кровообращение",
                "Измерить уровень глюкозы крови",
                "Установить венозный доступ",
                "Начать мониторинг жизненных функций"
            ]
        };
        
        return checklists[stationType] || ["Чек-лист для данной станции находится в разработке"];
    }

    closeStationPractice() {
        document.getElementById('stationPractice').classList.add('hidden');
        this.showToast('Тренировка станции завершена', 'info');
    }

    startStationTimer() {
        let timeLeft = 600; // 10 minutes in seconds
        const timerDisplay = document.getElementById('stationTimer');
        const startButton = document.getElementById('startTimer');
        
        startButton.disabled = true;
        startButton.textContent = 'Таймер запущен';
        
        const timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.showToast('Время вышло!', 'error');
                startButton.disabled = false;
                startButton.textContent = 'Старт';
            }
        }, 1000);
    }

    updateStationScore() {
        const checklistItems = document.querySelectorAll('.checklist-item');
        let checkedCount = 0;
        
        checklistItems.forEach(item => {
            if (item.querySelector('input').checked) {
                checkedCount++;
            }
        });
        
        const totalItems = checklistItems.length;
        const score = Math.round((checkedCount / totalItems) * 25); // Max 25 points
        
        document.getElementById('stationScore').textContent = `${score}/25`;
    }

    submitStationPractice() {
        const score = document.getElementById('stationScore').textContent;
        this.showToast(`Станция завершена! Набрано баллов: ${score}`, 'success');
        this.awardXP(20);
        this.closeStationPractice();
    }

    initializeChecklists() {
        const viewChecklistButtons = document.querySelectorAll('.view-checklist');
        
        viewChecklistButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const stationCard = e.target.closest('.station-card');
                const stationType = stationCard.getAttribute('data-station');
                this.showChecklistModal(stationType);
            });
        });
    }

    showChecklistModal(stationType) {
        // In a real app, this would open a modal with the full checklist
        this.showToast(`Чек-лист для станции "${stationType}" открыт`, 'info');
    }

    initializeTasks() {
        this.initializeTaskSystem();
    }

    initializeTaskSystem() {
        const startTaskButton = document.getElementById('startRandomTask');
        const prevTaskButton = document.getElementById('prevTaskStep');
        const nextTaskButton = document.getElementById('nextTaskStep');
        
        startTaskButton.addEventListener('click', () => {
            this.startRandomTask();
        });
        
        prevTaskButton.addEventListener('click', () => {
            this.previousTaskStep();
        });
        
        nextTaskButton.addEventListener('click', () => {
            this.nextTaskStep();
        });
        
        // Initialize task state
        this.taskState = {
            currentTask: null,
            currentStep: 0,
            userAnswers: [],
            totalSteps: 4
        };
    }

    startRandomTask() {
        const taskProgress = document.getElementById('taskProgress');
        const taskContent = document.getElementById('taskContent');
        
        taskProgress.classList.remove('hidden');
        taskContent.classList.remove('hidden');
        
        this.taskState.currentStep = 0;
        this.taskState.userAnswers = [];
        this.taskState.currentTask = this.getRandomTask();
        
        this.updateTaskProgress();
        this.displayTaskStep();
        
        this.showToast('Ситуационная задача начата', 'info');
    }

    getRandomTask() {
        // Sample task data - in real app this would come from a database
        return {
            scenario: "Пациент 45 лет, жалуется на боли за грудиной давящего характера с иррадиацией в левую руку, длительностью 20 минут. АД 150/90 мм рт.ст., ЧСС 95 уд/мин. В анамнезе - артериальная гипертензия.",
            steps: [
                {
                    question: "Какие лабораторные и инструментальные обследования необходимо назначить в первую очередь?",
                    options: [
                        "ЭКГ, тропонины, общий анализ крови",
                        "Рентгенография органов грудной клетки, УЗИ брюшной полости",
                        "МРТ сердца, коронароангиография",
                        "Суточное мониторирование ЭКГ, велоэргометрия"
                    ],
                    correctAnswer: 0
                },
                {
                    question: "На основании результатов (ЭКГ: подъем сегмента ST в отведениях V1-V4) какой предварительный диагноз наиболее вероятен?",
                    options: [
                        "Острый инфаркт миокарда передней стенки левого желудочка",
                        "Нестабильная стенокардия",
                        "Перикардит",
                        "Расслаивающая аневризма аорты"
                    ],
                    correctAnswer: 0
                }
                // Additional steps would be defined here
            ]
        };
    }

    updateTaskProgress() {
        const taskSteps = document.querySelectorAll('.task-step');
        taskSteps.forEach((step, index) => {
            if (index === this.taskState.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    displayTaskStep() {
        const taskDescription = document.getElementById('taskDescription');
        const taskQuestion = document.getElementById('taskQuestion');
        const taskOptions = document.getElementById('taskOptions');
        const prevButton = document.getElementById('prevTaskStep');
        const nextButton = document.getElementById('nextTaskStep');
        
        // Update scenario (only show on first step)
        if (this.taskState.currentStep === 0) {
            taskDescription.textContent = this.taskState.currentTask.scenario;
        }
        
        // Update question and options
        const currentStep = this.taskState.currentTask.steps[this.taskState.currentStep];
        taskQuestion.textContent = currentStep.question;
        
        taskOptions.innerHTML = '';
        currentStep.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
            
            optionElement.addEventListener('click', () => {
                this.selectTaskOption(optionElement, index);
            });
            
            taskOptions.appendChild(optionElement);
        });
        
        // Update navigation buttons
        prevButton.disabled = this.taskState.currentStep === 0;
        
        if (this.taskState.currentStep === this.taskState.totalSteps - 1) {
            nextButton.textContent = 'Завершить задачу';
        } else {
            nextButton.textContent = 'Далее';
        }
    }

    selectTaskOption(optionElement, optionIndex) {
        const options = document.querySelectorAll('#taskOptions .option');
        
        // Clear previous selection
        options.forEach(opt => opt.classList.remove('selected'));
        
        // Mark selected option
        optionElement.classList.add('selected');
        
        // Store user answer
        this.taskState.userAnswers[this.taskState.currentStep] = optionIndex;
    }

    previousTaskStep() {
        if (this.taskState.currentStep > 0) {
            this.taskState.currentStep--;
            this.updateTaskProgress();
            this.displayTaskStep();
        }
    }

    nextTaskStep() {
        if (this.taskState.currentStep < this.taskState.totalSteps - 1) {
            this.taskState.currentStep++;
            this.updateTaskProgress();
            this.displayTaskStep();
        } else {
            this.finishTask();
        }
    }

    finishTask() {
        // Calculate score
        let correctAnswers = 0;
        this.taskState.userAnswers.forEach((answer, index) => {
            if (answer === this.taskState.currentTask.steps[index].correctAnswer) {
                correctAnswers++;
            }
        });
        
        const score = correctAnswers;
        const total = this.taskState.currentTask.steps.length;
        
        this.showToast(`Задача завершена! Правильных ответов: ${score}/${total}`, 'success');
        this.awardXP(score * 8);
        
        // Hide task interface
        document.getElementById('taskProgress').classList.add('hidden');
        document.getElementById('taskContent').classList.add('hidden');
    }

    initializeQuickActions() {
        const actionCards = document.querySelectorAll('.action-card');
        
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        const actionHandlers = {
            'random-theory': () => {
                document.querySelector('.tab[data-tab="theory"]').click();
                document.getElementById('startRandomTest').click();
            },
            'cpr-training': () => {
                document.querySelector('.tab[data-tab="stations"]').click();
                document.querySelector('.station-card[data-station="cpr"] .practice-station').click();
            },
            'emergency': () => {
                document.querySelector('.tab[data-tab="stations"]').click();
                document.querySelector('.station-card[data-station="emergency"] .practice-station').click();
            },
            'checklists': () => {
                this.showToast('Все чек-листы доступны в разделе "Материалы"', 'info');
                document.querySelector('.tab[data-tab="materials"]').click();
            }
        };
        
        if (actionHandlers[action]) {
            actionHandlers[action]();
        }
    }

    awardXP(amount) {
        this.currentXP += amount;
        
        // Check for level up
        const xpForNextLevel = this.currentLevel * 100;
        if (this.currentXP >= xpForNextLevel) {
            this.currentLevel++;
            this.currentXP -= xpForNextLevel;
            this.showToast(`Поздравляем! Вы достигли уровня ${this.currentLevel}!`, 'success');
        }

        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        document.getElementById('xpValue').textContent = this.currentXP;
        document.getElementById('levelValue').textContent = this.currentLevel;
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }

    // Simulate daily login bonus
    simulateDailyLogin() {
        this.awardXP(100);
        this.showToast('Ежедневный бонус! +100 XP', 'success');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MedMateApp();
    
    // Simulate daily login after 3 seconds
    setTimeout(() => {
        app.simulateDailyLogin();
    }, 3000);
});

// Add interactive background effects
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.card, .exam-card, .station-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});
