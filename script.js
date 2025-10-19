class MedMateApp {
    constructor() {
        this.currentXP = 0;
        this.currentLevel = 1;
        this.userType = 'doctor';
        this.userStats = {
            theories: { completed: 0, total: 0, correct: 0 },
            stations: { completed: 0, total: 5, scores: {} },
            tasks: { completed: 0, total: 0, correct: 0 }
        };
        this.dailyProgress = {
            questions: 0,
            completed: false,
            lastCompleted: null
        };
        this.progressHistory = [];
        this.currentExam = null;
        this.initializeApp();
    }

    initializeApp() {
        this.loadProgress();
        this.initializeTabs();
        this.initializeUserType();
        this.initializeExamProgress();
        this.initializeTheory();
        this.initializeStations();
        this.initializeTasks();
        this.initializeQuickActions();
        this.initializeMobileFeatures();
        this.initializeProfile();
        this.updateAllDisplays();
        this.checkDailyChallenge();
        
        this.updateContentForUserType();
    }

    loadProgress() {
        const saved = localStorage.getItem('medmate_progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentXP = data.currentXP || 0;
            this.currentLevel = data.currentLevel || 1;
            this.userStats = data.userStats || this.userStats;
            this.dailyProgress = data.dailyProgress || this.dailyProgress;
            this.progressHistory = data.progressHistory || [];
        }
    }

    saveProgress() {
        const data = {
            currentXP: this.currentXP,
            currentLevel: this.currentLevel,
            userStats: this.userStats,
            dailyProgress: this.dailyProgress,
            progressHistory: this.progressHistory,
            lastSave: new Date().toISOString()
        };
        localStorage.setItem('medmate_progress', JSON.stringify(data));
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

                // Special handling for progress tab
                if (targetTab === 'progress') {
                    this.updateProgressChart();
                }

                this.showToast('Переход выполнен успешно!', 'success');
            });
        });
    }

    initializeUserType() {
        const userTypeSelect = document.getElementById('userType');
        userTypeSelect.value = this.userType;
        
        userTypeSelect.addEventListener('change', (e) => {
            this.userType = e.target.value;
            this.updateContentForUserType();
            this.updateAllDisplays();
            this.showToast(`Режим изменен: ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
    }

    updateContentForUserType() {
        if (this.userType === 'nurse') {
            this.userStats.theories.total = 1200;
            this.userStats.tasks.total = 80;
        } else {
            this.userStats.theories.total = 1800;
            this.userStats.tasks.total = 150;
        }
        
        this.updateAllDisplays();
    }

    updateAllDisplays() {
        this.updateStatsDisplay();
        this.updateDashboardDisplay();
        this.updateProfileDisplay();
        this.updateTheoryDisplay();
        this.updateTasksDisplay();
        this.updateProgressDisplay();
        this.saveProgress();
    }

    updateStatsDisplay() {
        document.getElementById('xpValue').textContent = this.currentXP;
        document.getElementById('levelValue').textContent = this.currentLevel;
        
        document.getElementById('statsTheories').textContent = 
            `${this.userStats.theories.completed}/${this.userStats.theories.total}`;
        document.getElementById('statsStations').textContent = 
            `${this.userStats.stations.completed}/${this.userStats.stations.total}`;
        document.getElementById('statsTasks').textContent = 
            `${this.userStats.tasks.completed}/${this.userStats.tasks.total}`;
    }

    updateDashboardDisplay() {
        const theoryProgress = this.userStats.theories.total > 0 ? 
            Math.round((this.userStats.theories.completed / this.userStats.theories.total) * 100) : 0;
        
        document.getElementById('dashboardTheories').textContent = 
            `${this.userStats.theories.total} вопросов из банка ФМЗА и МедикТест`;
        document.getElementById('completedTheories').textContent = this.userStats.theories.completed;
        document.getElementById('progressTheories').textContent = `${theoryProgress}%`;

        const stationsProgress = Math.round((this.userStats.stations.completed / this.userStats.stations.total) * 100);
        document.getElementById('completedStations').textContent = this.userStats.stations.completed;
        document.getElementById('progressStations').textContent = `${stationsProgress}%`;

        const tasksProgress = this.userStats.tasks.total > 0 ? 
            Math.round((this.userStats.tasks.completed / this.userStats.tasks.total) * 100) : 0;
        document.getElementById('dashboardTasks').textContent = 
            `${this.userStats.tasks.total} клинических задач с решениями`;
        document.getElementById('completedTasks').textContent = this.userStats.tasks.completed;
        document.getElementById('progressTasks').textContent = `${tasksProgress}%`;

        // Update badges
        document.getElementById('theoryCount').textContent = this.userStats.theories.total;
        document.getElementById('tasksCount').textContent = this.userStats.tasks.total;
    }

    updateTheoryDisplay() {
        const efficiency = this.userStats.theories.completed > 0 ? 
            Math.round((this.userStats.theories.correct / this.userStats.theories.completed) * 100) : 0;
        
        document.getElementById('efficiencyValue').textContent = `${efficiency}%`;
        document.getElementById('efficiencyProgress').style.width = `${efficiency}%`;
        
        // Calculate average speed (placeholder)
        const avgSpeed = this.userStats.theories.completed > 0 ? 
            Math.round(45000 / this.userStats.theories.completed) : 0;
        document.getElementById('speedValue').textContent = `${avgSpeed} сек/вопрос`;
    }

    updateTasksDisplay() {
        document.getElementById('solvedTasks').textContent = this.userStats.tasks.completed;
        
        const accuracy = this.userStats.tasks.completed > 0 ? 
            Math.round((this.userStats.tasks.correct / (this.userStats.tasks.completed * 4)) * 100) : 0;
        document.getElementById('taskAccuracy').textContent = `${accuracy}%`;
        
        const avgScore = this.userStats.tasks.completed > 0 ? 
            (this.userStats.tasks.correct / this.userStats.tasks.completed).toFixed(1) : '0';
        document.getElementById('averageScore').textContent = avgScore;
    }

    updateProgressDisplay() {
        document.getElementById('progressTheoriesCompleted').textContent = this.userStats.theories.completed;
        document.getElementById('progressTheoriesAccuracy').textContent = 
            this.userStats.theories.completed > 0 ? 
            `${Math.round((this.userStats.theories.correct / this.userStats.theories.completed) * 100)}%` : '0%';
        
        document.getElementById('progressStationsCompleted').textContent = this.userStats.stations.completed;
        document.getElementById('progressStationsScore').textContent = 
            this.userStats.stations.completed > 0 ? '4.2' : '0';
        
        document.getElementById('progressTasksCompleted').textContent = this.userStats.tasks.completed;
        document.getElementById('progressTasksAccuracy').textContent = 
            this.userStats.tasks.completed > 0 ? 
            `${Math.round((this.userStats.tasks.correct / (this.userStats.tasks.completed * 4)) * 100)}%` : '0%';
    }

    updateProfileDisplay() {
        const profileName = this.userType === 'nurse' ? 'Медсестра Петрова И.С.' : 'Доктор Иванов А.С.';
        const profileRole = this.userType === 'nurse' ? 
            'Студент 3 курса сестринского дела' : 'Студент 6 курса лечебного факультета';
        
        document.getElementById('profileName').textContent = profileName;
        document.getElementById('profileRole').textContent = profileRole;
        
        // Update modal profile
        document.getElementById('modalProfileName').textContent = profileName;
        document.getElementById('modalProfileRole').textContent = profileRole;
        document.getElementById('modalLevel').textContent = this.currentLevel;
        document.getElementById('modalXP').textContent = this.currentXP;
        
        // Calculate days in system (placeholder)
        const daysInSystem = Math.max(1, Math.floor(this.userStats.theories.completed / 50) + 1);
        document.getElementById('modalDays').textContent = daysInSystem;
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
        
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => step.classList.remove('active'));
        
        document.querySelector(`.step[data-step="${this.getStepNumber(examType)}"]`).classList.add('active');
        
        const targetTab = this.getTabForExam(examType);
        document.querySelector(`.tab[data-tab="${targetTab}"]`).click();
        
        this.showToast(`Начата подготовка к этапу: ${this.getExamName(examType)}`, 'success');
    }

    getStepNumber(examType) {
        const stepMap = { 'theory': 1, 'stations': 2, 'tasks': 3 };
        return stepMap[examType] || 1;
    }

    getTabForExam(examType) {
        const tabMap = { 'theory': 'theory', 'stations': 'stations', 'tasks': 'tasks' };
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
        this.quizState = {
            currentQuestion: 0,
            score: 0,
            timer: null,
            timeLeft: 1800,
            questions: [],
            userAnswers: [],
            startTime: null
        };

        document.getElementById('startRandomTest').addEventListener('click', () => {
            this.startRandomTest();
        });

        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('skipQuestion').addEventListener('click', () => {
            this.skipQuestion();
        });

        document.getElementById('restartQuiz').addEventListener('click', () => {
            this.startRandomTest();
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
                difficulty: "medium",
                category: "pharmacology"
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
                difficulty: "easy",
                category: "emergency"
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
                difficulty: "hard",
                category: "therapy"
            },
            {
                question: "Какой антибиотик является препаратом выбора при внебольничной пневмонии?",
                options: [
                    { text: "Амоксициллин/клавуланат", correct: true },
                    { text: "Ципрофлоксацин", correct: false },
                    { text: "Цефтриаксон", correct: false },
                    { text: "Азитромицин", correct: false }
                ],
                explanation: "Амоксициллин/клавуланат является препаратом выбора при внебольничной пневмонии согласно российским рекомендациям.",
                difficulty: "medium",
                category: "therapy"
            },
            {
                question: "Какой диагностический критерий используется для диагностики инфаркта миокарда?",
                options: [
                    { text: "Повышение тропонинов + клиническая картина", correct: true },
                    { text: "Только изменения на ЭКГ", correct: false },
                    { text: "Только боль в грудной клетке", correct: false },
                    { text: "Повышение АЛТ и АСТ", correct: false }
                ],
                explanation: "Диагноз инфаркта миокарда устанавливается при сочетании повышения кардиоспецифичных тропонинов с клинической картиной и/или изменениями на ЭКГ.",
                difficulty: "hard",
                category: "cardiology"
            },
            {
                question: "Какой препарат противопоказан при бронхиальной астме?",
                options: [
                    { text: "Бета-блокаторы", correct: true },
                    { text: "Ингибиторы АПФ", correct: false },
                    { text: "Блокаторы кальциевых каналов", correct: false },
                    { text: "Диуретики", correct: false }
                ],
                explanation: "Бета-блокаторы могут вызывать бронхоспазм и противопоказаны при бронхиальной астме.",
                difficulty: "medium",
                category: "pharmacology"
            },
            {
                question: "Какой симптом характерен для менингита?",
                options: [
                    { text: "Ригидность затылочных мышц", correct: true },
                    { text: "Боль в пояснице", correct: false },
                    { text: "Отеки ног", correct: false },
                    { text: "Желтуха", correct: false }
                ],
                explanation: "Ригидность затылочных мышц - классический менингеальный симптом.",
                difficulty: "easy",
                category: "neurology"
            },
            {
                question: "Какова первая помощь при гипогликемической коме?",
                options: [
                    { text: "Внутривенное введение 40% глюкозы", correct: true },
                    { text: "Подкожное введение инсулина", correct: false },
                    { text: "Внутримышечное введение глюкагона", correct: false },
                    { text: "Пероральный прием сахара", correct: false }
                ],
                explanation: "При гипогликемической коме необходимо срочное внутривенное введение 40% глюкозы.",
                difficulty: "medium",
                category: "endocrinology"
            }
        ];
    }

    startRandomTest() {
        const quizContainer = document.getElementById('quizContainer');
        const resultsContainer = document.getElementById('quizResults');
        const statsContainer = document.getElementById('theoryStats');
        
        quizContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        statsContainer.classList.add('hidden');
        
        // Get filtered questions
        const discipline = document.getElementById('disciplineFilter').value;
        const difficulty = document.getElementById('difficultyFilter').value;
        
        let questions = this.getSampleQuestions();
        
        if (discipline !== 'all') {
            questions = questions.filter(q => q.category === discipline);
        }
        
        if (difficulty !== 'all') {
            questions = questions.filter(q => q.difficulty === difficulty);
        }
        
        // Shuffle and take 20 questions
        questions = this.shuffleArray(questions).slice(0, 20);
        
        this.quizState = {
            currentQuestion: 0,
            score: 0,
            timer: null,
            timeLeft: 1800,
            questions: questions,
            userAnswers: new Array(questions.length).fill(null),
            startTime: Date.now()
        };
        
        this.startQuizTimer();
        this.displayQuestion();
        
        this.showToast('Тест начат! У вас 30 минут.', 'info');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
        if (this.quizState.questions.length === 0) return;
        
        const question = this.quizState.questions[this.quizState.currentQuestion];
        const questionElement = document.getElementById('quizQuestion');
        const optionsElement = document.getElementById('quizOptions');
        const progressElement = document.getElementById('quizProgress');
        const currentQuestionElement = document.getElementById('currentQuestion');
        const totalQuestionsElement = document.getElementById('totalQuestions');
        const difficultyElement = document.getElementById('questionDifficulty');
        const explanationElement = document.getElementById('quizExplanation');
        const nextButton = document.getElementById('nextQuestion');

        questionElement.textContent = question.question;
        currentQuestionElement.textContent = this.quizState.currentQuestion + 1;
        totalQuestionsElement.textContent = this.quizState.questions.length;
        
        const progress = ((this.quizState.currentQuestion + 1) / this.quizState.questions.length) * 100;
        progressElement.style.width = `${progress}%`;
        
        difficultyElement.textContent = this.getDifficultyText(question.difficulty);
        difficultyElement.className = `difficulty ${question.difficulty}`;
        
        optionsElement.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            if (this.quizState.userAnswers[this.quizState.currentQuestion] === index) {
                optionElement.classList.add('selected');
            }
            optionElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option.text}</span>
            `;
            
            optionElement.addEventListener('click', () => {
                this.selectOption(optionElement, option.correct, index);
            });
            
            optionsElement.appendChild(optionElement);
        });
        
        explanationElement.classList.add('hidden');
        nextButton.disabled = this.quizState.userAnswers[this.quizState.currentQuestion] === null;
        nextButton.textContent = this.quizState.currentQuestion === this.quizState.questions.length - 1 ? 
            'Завершить тест' : 'Следующий вопрос';
    }

    getDifficultyText(difficulty) {
        const difficultyMap = { 'easy': 'Легко', 'medium': 'Средняя', 'hard': 'Сложная' };
        return difficultyMap[difficulty] || 'Средняя';
    }

    selectOption(optionElement, isCorrect, optionIndex) {
        const options = document.querySelectorAll('.option');
        const explanationElement = document.getElementById('quizExplanation');
        const explanationText = document.getElementById('explanationText');
        const nextButton = document.getElementById('nextQuestion');
        
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            opt.classList.remove('selected', 'correct', 'wrong');
        });
        
        this.quizState.userAnswers[this.quizState.currentQuestion] = optionIndex;
        
        optionElement.classList.add('selected');
        
        if (isCorrect) {
            optionElement.classList.add('correct');
        } else {
            optionElement.classList.add('wrong');
            options.forEach((opt, index) => {
                if (this.quizState.questions[this.quizState.currentQuestion].options[index].correct) {
                    opt.classList.add('correct');
                }
            });
        }
        
        const explanation = this.quizState.questions[this.quizState.currentQuestion].explanation;
        explanationText.textContent = explanation;
        explanationElement.classList.remove('hidden');
        
        nextButton.disabled = false;
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
        this.quizState.userAnswers[this.quizState.currentQuestion] = -1;
        this.showToast('Вопрос пропущен', 'info');
        this.nextQuestion();
    }

    finishQuiz() {
        if (this.quizState.timer) {
            clearInterval(this.quizState.timer);
        }
        
        // Calculate score
        let correctAnswers = 0;
        this.quizState.userAnswers.forEach((answer, index) => {
            if (answer !== -1 && this.quizState.questions[index].options[answer].correct) {
                correctAnswers++;
            }
        });
        
        const total = this.quizState.questions.length;
        const percentage = Math.round((correctAnswers / total) * 100);
        
        // Update results display
        document.getElementById('correctAnswers').textContent = correctAnswers;
        document.getElementById('totalQuestionsResult').textContent = total;
        document.getElementById('successRate').textContent = `${percentage}%`;
        
        // Calculate and award XP
        const baseXP = correctAnswers * 10;
        const timeBonus = this.quizState.timeLeft > 600 ? 50 : 0;
        const perfectBonus = correctAnswers === total ? 100 : 0;
        const totalXP = baseXP + timeBonus + perfectBonus;
        
        document.getElementById('earnedXP').textContent = totalXP;
        
        // Update user stats
        this.userStats.theories.completed += total;
        this.userStats.theories.correct += correctAnswers;
        
        // Update daily progress
        this.dailyProgress.questions += total;
        this.updateDailyProgress();
        
        // Show results and hide quiz
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');
        document.getElementById('theoryStats').classList.remove('hidden');
        
        // Award XP
        this.awardXP(totalXP);
        
        // Add to progress history
        this.addProgressRecord('theory', correctAnswers, total);
        
        this.showToast(`Тест завершен! Результат: ${correctAnswers}/${total} (${percentage}%). Получено ${totalXP} XP`, 'success');
        this.updateAllDisplays();
    }

    initializeStations() {
        this.initializeStationPractice();
        this.initializeChecklists();
        this.renderStationsGrid();
    }

    renderStationsGrid() {
        const stationsGrid = document.querySelector('.stations-grid');
        const stations = [
            {
                id: 'cpr',
                name: 'СЛР',
                time: '10 минут',
                description: 'Сердечно-лёгочная реанимация взрослого и ребёнка',
                completed: this.userStats.stations.scores.cpr !== undefined
            },
            {
                id: 'emergency',
                name: 'Неотложная помощь',
                time: '15 минут',
                description: 'Оказание неотложной помощи при острых состояниях',
                completed: this.userStats.stations.scores.emergency !== undefined
            },
            {
                id: 'examination',
                name: 'Физикальное обследование',
                time: '12 минут',
                description: 'Обследование сердечно-сосудистой и дыхательной систем',
                completed: this.userStats.stations.scores.examination !== undefined
            },
            {
                id: 'history',
                name: 'Сбор жалоб и анамнеза',
                time: '8 минут',
                description: 'Стандартизированный сбор информации у пациента',
                completed: this.userStats.stations.scores.history !== undefined
            },
            {
                id: 'prevention',
                name: 'Профилактический осмотр',
                time: '10 минут',
                description: 'Профосмотр и рекомендации по профилактике',
                completed: this.userStats.stations.scores.prevention !== undefined
            }
        ];

        stationsGrid.innerHTML = stations.map(station => `
            <div class="station-card ${station.completed ? 'station-completed' : 'station-not-started'}" data-station="${station.id}">
                <div class="station-header">
                    <div class="station-icon">
                        <i class="fas fa-${this.getStationIcon(station.id)}"></i>
                    </div>
                    <div class="station-info">
                        <h3>${station.name}</h3>
                        <span class="station-time">${station.time}</span>
                    </div>
                    <span class="completion-badge ${station.completed ? 'completed' : 'not-started'}">
                        ${station.completed ? 'Освоено' : 'Не начато'}
                    </span>
                </div>
                <p>${station.description}</p>
                <div class="station-actions">
                    <button class="button primary practice-station">Тренировать</button>
                    <button class="button secondary view-checklist">Чек-лист</button>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners
        this.initializeStationPractice();
        this.initializeChecklists();
    }

    getStationIcon(stationId) {
        const icons = {
            'cpr': 'heartbeat',
            'emergency': 'ambulance',
            'examination': 'stethoscope',
            'history': 'comment-medical',
            'prevention': 'shield-virus'
        };
        return icons[stationId] || 'procedures';
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
        
        const stationNames = {
            'cpr': 'СЛР - Сердечно-лёгочная реанимация',
            'emergency': 'Неотложная помощь',
            'examination': 'Физикальное обследование',
            'history': 'Сбор жалоб и анамнеза',
            'prevention': 'Профилактический осмотр'
        };
        
        stationName.textContent = stationNames[stationType] || 'Практическая станция';
        
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
        
        document.getElementById('stationTimer').textContent = '10:00';
        document.getElementById('stationScore').textContent = '0/25';
        
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
        let timeLeft = 600;
        const timerDisplay = document.getElementById('stationTimer');
        const startButton = document.getElementById('startTimer');
        
        startButton.disabled = true;
        startButton.textContent = 'Таймер запущен';
        
        this.stationTimer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(this.stationTimer);
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
        const score = Math.round((checkedCount / totalItems) * 25);
        
        document.getElementById('stationScore').textContent = `${score}/25`;
    }

    submitStationPractice() {
        const score = parseInt(document.getElementById('stationScore').textContent.split('/')[0]);
        const stationName = document.getElementById('practiceStationName').textContent.split(' - ')[0];
        const stationId = this.getStationIdFromName(stationName);
        
        // Update station completion
        if (!this.userStats.stations.scores[stationId]) {
            this.userStats.stations.completed++;
            this.userStats.stations.scores[stationId] = score;
        }
        
        // Award XP
        const xpEarned = score * 2;
        this.awardXP(xpEarned);
        
        this.showToast(`Станция "${stationName}" завершена! Набрано баллов: ${score}/25. Получено ${xpEarned} XP`, 'success');
        this.closeStationPractice();
        this.renderStationsGrid();
        this.updateAllDisplays();
    }

    getStationIdFromName(name) {
        const names = {
            'СЛР': 'cpr',
            'Неотложная помощь': 'emergency',
            'Физикальное обследование': 'examination',
            'Сбор жалоб и анамнеза': 'history',
            'Профилактический осмотр': 'prevention'
        };
        return names[name] || name.toLowerCase();
    }

    initializeTasks() {
        this.initializeTaskSystem();
    }

    initializeTaskSystem() {
        const startTaskButton = document.getElementById('startRandomTask');
        const prevTaskButton = document.getElementById('prevTaskStep');
        const nextTaskButton = document.getElementById('nextTaskStep');
        const restartTaskButton = document.getElementById('restartTask');
        
        startTaskButton.addEventListener('click', () => {
            this.startRandomTask();
        });
        
        prevTaskButton.addEventListener('click', () => {
            this.previousTaskStep();
        });
        
        nextTaskButton.addEventListener('click', () => {
            this.nextTaskStep();
        });
        
        restartTaskButton.addEventListener('click', () => {
            this.startRandomTask();
        });
        
        this.taskState = {
            currentTask: null,
            currentStep: 0,
            userAnswers: [],
            score: 0
        };
    }

    getSampleTasks() {
        return [
            {
                id: 1,
                specialty: "therapy",
                scenario: "Пациент 45 лет, жалуется на боли за грудиной давящего характера с иррадиацией в левую руку, длительностью 20 минут. АД 150/90 мм рт.ст., ЧСС 95 уд/мин. В анамнезе - артериальная гипертензия, курение.",
                steps: [
                    {
                        step: 1,
                        question: "Какие лабораторные и инструментальные обследования необходимо назначить в первую очередь?",
                        options: [
                            "ЭКГ, тропонины, общий анализ крови, глюкоза крови",
                            "Рентгенография органов грудной клетки, УЗИ брюшной полости",
                            "МРТ сердца, коронароангиография",
                            "Суточное мониторирование ЭКГ, велоэргометрия"
                        ],
                        correctAnswer: 0,
                        explanation: "При подозрении на ОКС необходимо немедленно выполнить ЭКГ и определить уровень тропонинов для подтверждения или исключения инфаркта миокарда."
                    },
                    {
                        step: 2,
                        question: "На основании результатов (ЭКГ: подъем сегмента ST в отведениях V1-V4) какой предварительный диагноз наиболее вероятен?",
                        options: [
                            "Острый инфаркт миокарда передней стенки левого желудочка",
                            "Нестабильная стенокардия",
                            "Перикардит",
                            "Расслаивающая аневризма аорты"
                        ],
                        correctAnswer: 0,
                        explanation: "Подъем сегмента ST в передних отведениях характерен для острого инфаркта миокарда передней стенки левого желудочка."
                    },
                    {
                        step: 3,
                        question: "Какая дифференциальная диагностика требуется?",
                        options: [
                            "Исключить расслаивающую аневризму аорты, ТЭЛА, перикардит",
                            "Исключить пневмонию, плеврит",
                            "Исключить язвенную болезнь желудка",
                            "Исключить остеохондроз грудного отдела позвоночника"
                        ],
                        correctAnswer: 0,
                        explanation: "Необходимо исключить жизнеугрожающие состояния, которые могут имитировать инфаркт миокарда."
                    },
                    {
                        step: 4,
                        question: "Какое лечение необходимо назначить в первые минуты?",
                        options: [
                            "Аспирин 250-500 мг разжевать, клопидогрел 300 мг, гепарин, морфин при боли",
                            "Нитроглицерин сублингвально, метопролол",
                            "Фуросемид, эналаприл",
                            "Антибиотики широкого спектра действия"
                        ],
                        correctAnswer: 0,
                        explanation: "В первые минуты при ОКС с подъемом ST показаны дезагреганты, антикоагулянты и обезболивающая терапия."
                    }
                ]
            },
            {
                id: 2,
                specialty: "surgery",
                scenario: "Пациент 35 лет, доставлен в приемное отделение с жалобами на интенсивные боли в правой подвздошной области, тошноту, однократную рвоту. Симптомы развились в течение 6 часов. Температура 37.8°C.",
                steps: [
                    {
                        step: 1,
                        question: "Какое обследование необходимо провести в первую очередь?",
                        options: [
                            "Пальпация живота, анализ крови, УЗИ брюшной полости",
                            "КТ органов брюшной полости с контрастированием",
                            "Рентгенография органов грудной клетки",
                            "ЭКГ, консультация кардиолога"
                        ],
                        correctAnswer: 0,
                        explanation: "При подозрении на острый аппендицит начинают с физикального обследования и базовых лабораторных и инструментальных методов."
                    },
                    {
                        step: 2,
                        question: "При положительном симптоме Щеткина-Блюмберга какой диагноз наиболее вероятен?",
                        options: [
                            "Острый аппендицит",
                            "Почечная колика",
                            "Острый холецистит",
                            "Внематочная беременность"
                        ],
                        correctAnswer: 0,
                        explanation: "Симптом Щеткина-Блюмберга характерен для перитонита, который часто развивается при остром аппендиците."
                    },
                    {
                        step: 3,
                        question: "Какие дополнительные методы диагностики наиболее информативны?",
                        options: [
                            "УЗИ органов брюшной полости, общий анализ крови",
                            "МРТ брюшной полости",
                            "Колоноскопия",
                            "ЭКГ"
                        ],
                        correctAnswer: 0,
                        explanation: "УЗИ позволяет визуализировать аппендикс, а анализ крови показывает воспалительные изменения."
                    },
                    {
                        step: 4,
                        question: "Какое лечение показано?",
                        options: [
                            "Экстренная аппендэктомия",
                            "Консервативная терапия антибиотиками",
                            "Наблюдение в динамике",
                            "Лапароскопическая диагностика"
                        ],
                        correctAnswer: 0,
                        explanation: "При подтвержденном остром аппендиците показана экстренная операция."
                    }
                ]
            }
        ];
    }

    startRandomTask() {
        const taskProgress = document.getElementById('taskProgress');
        const taskContent = document.getElementById('taskContent');
        const taskResults = document.getElementById('taskResults');
        
        taskProgress.classList.remove('hidden');
        taskContent.classList.remove('hidden');
        taskResults.classList.add('hidden');
        
        const tasks = this.getSampleTasks();
        this.taskState = {
            currentStep: 0,
            userAnswers: new Array(4).fill(null),
            score: 0,
            currentTask: tasks[Math.floor(Math.random() * tasks.length)]
        };
        
        this.updateTaskProgress();
        this.displayTaskStep();
        
        this.showToast('Ситуационная задача начата', 'info');
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
        
        if (this.taskState.currentStep === 0) {
            taskDescription.textContent = this.taskState.currentTask.scenario;
        }
        
        const currentStep = this.taskState.currentTask.steps[this.taskState.currentStep];
        taskQuestion.textContent = currentStep.question;
        
        taskOptions.innerHTML = '';
        currentStep.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            if (this.taskState.userAnswers[this.taskState.currentStep] === index) {
                optionElement.classList.add('selected');
            }
            optionElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
            
            optionElement.addEventListener('click', () => {
                this.selectTaskOption(optionElement, index);
            });
            
            taskOptions.appendChild(optionElement);
        });
        
        prevButton.disabled = this.taskState.currentStep === 0;
        
        if (this.taskState.currentStep === this.taskState.currentTask.steps.length - 1) {
            nextButton.textContent = 'Завершить задачу';
        } else {
            nextButton.textContent = 'Далее';
        }
        
        nextButton.disabled = this.taskState.userAnswers[this.taskState.currentStep] === null;
    }

    selectTaskOption(optionElement, optionIndex) {
        const options = document.querySelectorAll('#taskOptions .option');
        
        options.forEach(opt => opt.classList.remove('selected'));
        
        optionElement.classList.add('selected');
        
        this.taskState.userAnswers[this.taskState.currentStep] = optionIndex;
        
        document.getElementById('nextTaskStep').disabled = false;
    }

    previousTaskStep() {
        if (this.taskState.currentStep > 0) {
            this.taskState.currentStep--;
            this.updateTaskProgress();
            this.displayTaskStep();
        }
    }

    nextTaskStep() {
        if (this.taskState.userAnswers[this.taskState.currentStep] === null) {
            this.showToast('Пожалуйста, выберите ответ', 'error');
            return;
        }

        const currentStepData = this.taskState.currentTask.steps[this.taskState.currentStep];
        if (this.taskState.userAnswers[this.taskState.currentStep] === currentStepData.correctAnswer) {
            this.taskState.score++;
        }

        if (this.taskState.currentStep < this.taskState.currentTask.steps.length - 1) {
            this.taskState.currentStep++;
            this.updateTaskProgress();
            this.displayTaskStep();
        } else {
            this.finishTask();
        }
    }

    finishTask() {
        const score = this.taskState.score;
        const total = this.taskState.currentTask.steps.length;
        const percentage = Math.round((score / total) * 100);
        
        document.getElementById('taskCorrectAnswers').textContent = score;
        document.getElementById('taskTotalSteps').textContent = total;
        document.getElementById('taskSuccessRate').textContent = `${percentage}%`;
        
        const xpEarned = score * 20;
        document.getElementById('taskEarnedXP').textContent = xpEarned;
        
        document.getElementById('taskProgress').classList.add('hidden');
        document.getElementById('taskContent').classList.add('hidden');
        document.getElementById('taskResults').classList.remove('hidden');
        
        this.awardXP(xpEarned);
        this.userStats.tasks.completed++;
        this.userStats.tasks.correct += score;
        
        this.addProgressRecord('task', score, total);
        
        this.showToast(`Задача завершена! Правильных ответов: ${score}/${total} (${percentage}%). Получено ${xpEarned} XP`, 'success');
        this.updateAllDisplays();
    }

    initializeQuickActions() {
        const actionCards = document.querySelectorAll('.action-card');
        const dailyChallengeBtn = document.getElementById('startDailyChallenge');
        const downloadButtons = document.querySelectorAll('.download-btn');
        
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
        
        dailyChallengeBtn.addEventListener('click', () => {
            this.startDailyChallenge();
        });
        
        downloadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const file = e.target.getAttribute('data-file');
                this.downloadMaterial(file);
            });
        });
    }

    handleQuickAction(action) {
        const actionHandlers = {
            'random-theory': () => {
                document.querySelector('.tab[data-tab="theory"]').click();
                setTimeout(() => document.getElementById('startRandomTest').click(), 500);
            },
            'cpr-training': () => {
                document.querySelector('.tab[data-tab="stations"]').click();
                setTimeout(() => {
                    const cprStation = document.querySelector('.station-card[data-station="cpr"] .practice-station');
                    if (cprStation) cprStation.click();
                }, 500);
            },
            'emergency': () => {
                document.querySelector('.tab[data-tab="stations"]').click();
                setTimeout(() => {
                    const emergencyStation = document.querySelector('.station-card[data-station="emergency"] .practice-station');
                    if (emergencyStation) emergencyStation.click();
                }, 500);
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

    startDailyChallenge() {
        document.querySelector('.tab[data-tab="theory"]').click();
        setTimeout(() => document.getElementById('startRandomTest').click(), 500);
        this.showToast('Ежедневное задание начато! Пройдите 10 вопросов.', 'info');
    }

    downloadMaterial(file) {
        this.showToast(`Материал "${file}" будет скачан`, 'info');
        // В реальном приложении здесь будет загрузка файла
    }

    initializeProfile() {
        const profileBtn = document.getElementById('profileBtn');
        const closeProfileModal = document.getElementById('closeProfileModal');
        const profileModal = document.getElementById('profileModal');
        
        profileBtn.addEventListener('click', () => {
            profileModal.classList.remove('hidden');
        });
        
        closeProfileModal.addEventListener('click', () => {
            profileModal.classList.add('hidden');
        });
        
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.classList.add('hidden');
            }
        });
    }

    initializeMobileFeatures() {
        this.initializeTouchEvents();
        this.initializeSwipeGestures();
        this.initializeMobileNav();
    }

    initializeMobileNav() {
        const mobileToggle = document.getElementById('mobileNavToggle');
        const sidebar = document.getElementById('sidebar');
        
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
        
        // Close sidebar when clicking on a link
        const navLinks = document.querySelectorAll('.nav .tab');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
            });
        });
    }

    initializeTouchEvents() {
        document.addEventListener('touchstart', function() {}, {passive: true});
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    initializeSwipeGestures() {
        let startX = 0;
        let endX = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            this.handleSwipe(startX, endX);
        });
    }

    handleSwipe(startX, endX) {
        const diff = endX - startX;
        const minSwipeDistance = 50;
        
        if (Math.abs(diff) > minSwipeDistance) {
            const currentTab = document.querySelector('.tab.active');
            const tabs = Array.from(document.querySelectorAll('.tab'));
            const currentIndex = tabs.indexOf(currentTab);
            
            if (diff > 0 && currentIndex > 0) {
                tabs[currentIndex - 1].click();
            } else if (diff < 0 && currentIndex < tabs.length - 1) {
                tabs[currentIndex + 1].click();
            }
        }
    }

    awardXP(amount) {
        this.currentXP += amount;
        
        const xpForNextLevel = this.currentLevel * 100;
        if (this.currentXP >= xpForNextLevel) {
            this.currentLevel++;
            this.currentXP = this.currentXP - xpForNextLevel;
            this.showToast(`Поздравляем! Вы достигли уровня ${this.currentLevel}!`, 'success');
        }
        
        this.saveProgress();
    }

    checkDailyChallenge() {
        const today = new Date().toDateString();
        if (this.dailyProgress.lastCompleted !== today) {
            this.dailyProgress.questions = 0;
            this.dailyProgress.completed = false;
            this.dailyProgress.lastCompleted = null;
        }
        this.updateDailyProgress();
    }

    updateDailyProgress() {
        const progress = Math.min(this.dailyProgress.questions, 10);
        const percentage = (progress / 10) * 100;
        
        document.getElementById('dailyProgress').style.width = `${percentage}%`;
        document.getElementById('dailyProgressText').textContent = `${progress}/10`;
        
        if (progress >= 10 && !this.dailyProgress.completed) {
            this.dailyProgress.completed = true;
            this.dailyProgress.lastCompleted = new Date().toDateString();
            this.awardXP(100);
            this.showToast('Ежедневное задание выполнено! +100 XP', 'success');
        }
    }

    addProgressRecord(type, score, total) {
        const record = {
            date: new Date().toISOString(),
            type: type,
            score: score,
            total: total,
            xp: type === 'theory' ? score * 10 : score * 20
        };
        
        this.progressHistory.push(record);
        
        // Keep only last 30 records
        if (this.progressHistory.length > 30) {
            this.progressHistory = this.progressHistory.slice(-30);
        }
        
        this.saveProgress();
    }

    updateProgressChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        // Prepare data for last 7 days
        const last7Days = this.getLast7DaysProgress();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(day => day.date),
                datasets: [{
                    label: 'Вопросы решены',
                    data: last7Days.map(day => day.questions),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Количество вопросов'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Дата'
                        }
                    }
                }
            }
        });
    }

    getLast7DaysProgress() {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            
            const dayProgress = this.progressHistory.filter(record => {
                const recordDate = new Date(record.date).toDateString();
                return recordDate === date.toDateString();
            });
            
            const questions = dayProgress.reduce((sum, record) => sum + record.total, 0);
            
            result.push({
                date: dateStr,
                questions: questions
            });
        }
        return result;
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

        const hideTime = window.innerWidth <= 768 ? 3000 : 5000;
        
        setTimeout(() => {
            toast.style.animation = window.innerWidth <= 768 ? 'slideInDown 0.3s ease reverse' : 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, hideTime);
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
        this.showToast(`Чек-лист для станции "${stationType}" открыт`, 'info');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MedMateApp();
    
    // Add service worker for PWA capabilities (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
});

// Add orientation change handler
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});
