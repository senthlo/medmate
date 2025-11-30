class MedMateApp {
    constructor() {
        this.currentXP = 0;
        this.currentLevel = 1;
        this.userType = 'doctor';
        this.userStats = {
            theories: { 
                completed: 0, 
                total: 1800, 
                correct: 0,
                timeSpent: 0,
                bestStreak: 0,
                currentStreak: 0
            },
            stations: { 
                completed: 0, 
                total: 5, 
                scores: {},
                practiceCount: {}
            },
            tasks: { 
                completed: 0, 
                total: 150, 
                correct: 0,
                averageScore: 0
            }
        };
        this.achievements = {
            'first-test': false,
            'cpr-master': false,
            'theory-expert': false,
            'task-master': false
        };
        this.dailyProgress = {
            questions: 0,
            completed: false,
            lastCompleted: null
        };
        this.progressHistory = [];
        this.currentExam = null;
        this.quizState = null;
        this.mobileMenuOpen = false;
        this.stationTimer = null;
        this.taskTimer = null;
        
        // Video URL from Google Drive
        this.videoUrl = 'https://drive.google.com/file/d/1OGPSuoUQmbV7hXWF3geoYKqLxUY9BFga/preview';
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadProgress();
        this.initializeMobileMenu();
        this.initializeTabs();
        this.initializeUserType();
        this.initializeExamProgress();
        this.initializeTheory();
        this.initializeStations();
        this.initializeTasks();
        this.initializeQuickActions();
        this.updateAllDisplays();
        this.checkDailyChallenge();
        
        console.log('MedMate App initialized successfully!');
    }

    // Новый метод для мобильного меню
    initializeMobileMenu() {
        const menuButton = document.getElementById('mobileMenuButton');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        menuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Закрываем меню при клике на таб
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (this.mobileMenuOpen) {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('mobile-open');
        } else {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('mobile-open');
        this.mobileMenuOpen = false;
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('medmate_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentXP = data.currentXP || 0;
                this.currentLevel = data.currentLevel || 1;
                this.userStats = data.userStats || this.userStats;
                this.achievements = data.achievements || this.achievements;
                this.dailyProgress = data.dailyProgress || this.dailyProgress;
                this.progressHistory = data.progressHistory || [];
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }

    saveProgress() {
        try {
            const data = {
                currentXP: this.currentXP,
                currentLevel: this.currentLevel,
                userStats: this.userStats,
                achievements: this.achievements,
                dailyProgress: this.dailyProgress,
                progressHistory: this.progressHistory
            };
            localStorage.setItem('medmate_progress', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
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

                if (targetTab === 'progress') {
                    this.updateProgressTab();
                }
            });
        });
    }

    initializeUserType() {
        // Only doctor mode is available
        this.userType = 'doctor';
    }

    updateAllDisplays() {
        this.updateStatsDisplay();
        this.updateDashboardDisplay();
        this.updateStationsDisplay();
        this.saveProgress();
    }

    updateStatsDisplay() {
        this.updateElementText('#xpValue', this.currentXP);
        this.updateElementText('#levelValue', this.currentLevel);
        this.updateElementText('#statsTheories', `${this.userStats.theories.completed}/${this.userStats.theories.total}`);
        this.updateElementText('#statsStations', `${this.userStats.stations.completed}/${this.userStats.stations.total}`);
        this.updateElementText('#statsTasks', `${this.userStats.tasks.completed}/${this.userStats.tasks.total}`);
    }

    updateDashboardDisplay() {
        this.updateElementText('#completedTheories', this.userStats.theories.completed);
        this.updateElementText('#completedStations', this.userStats.stations.completed);
        this.updateElementText('#completedTasks', this.userStats.tasks.completed);
        
        // Calculate progress percentages
        const theoryProgress = Math.round((this.userStats.theories.completed / this.userStats.theories.total) * 100);
        const stationProgress = Math.round((this.userStats.stations.completed / this.userStats.stations.total) * 100);
        const taskProgress = Math.round((this.userStats.tasks.completed / this.userStats.tasks.total) * 100);
        
        this.updateElementText('#progressTheories', `${theoryProgress}%`);
        this.updateElementText('#progressStations', `${stationProgress}%`);
        this.updateElementText('#progressTasks', `${taskProgress}%`);
    }

    // Theory Section
    initializeTheory() {
        // Start Random Test button
        this.getElement('#startRandomTest')?.addEventListener('click', () => {
            this.startRandomQuiz();
        });

        // Exam cards
        document.querySelectorAll('.start-exam').forEach(card => {
            card.addEventListener('click', (e) => {
                const examType = e.currentTarget.getAttribute('data-exam');
                if (examType === 'theory') {
                    this.startRandomQuiz();
                } else if (examType === 'stations') {
                    this.switchToTab('stations');
                } else if (examType === 'tasks') {
                    this.switchToTab('tasks');
                }
            });
        });

        // Quiz navigation
        this.getElement('#nextQuestion')?.addEventListener('click', () => this.nextQuestion());
        this.getElement('#prevQuestion')?.addEventListener('click', () => this.prevQuestion());
        this.getElement('#skipQuestion')?.addEventListener('click', () => this.skipQuestion());
        this.getElement('#restartQuiz')?.addEventListener('click', () => this.startRandomQuiz());
    }

    startRandomQuiz() {
        this.quizState = {
            questions: this.generateRandomQuestions(5),
            currentQuestion: 0,
            userAnswers: [],
            timeLeft: 600, // 10 minutes
            timer: null
        };

        this.quizState.userAnswers = new Array(this.quizState.questions.length).fill(-1);
        this.showQuizInterface();
        this.displayQuestion(0);
        this.startQuizTimer();
    }

    generateRandomQuestions(count) {
        const questionBank = [
            {
                question: "Какой препарат является препаратом выбора при анафилактическом шоке?",
                options: [
                    { text: "Адреналин", correct: true },
                    { text: "Преднизолон", correct: false },
                    { text: "Супрастин", correct: false },
                    { text: "Сальбутамол", correct: false }
                ],
                explanation: "Адреналин является препаратом первой линии при анафилактическом шоке благодаря своему быстрому действию на альфа- и бета-адренорецепторы. Альфа-эффекты вызывают вазоконстрикцию, что повышает артериальное давление и уменьшает отек, а бета-эффекты вызывают бронходилатацию и положительное инотропное действие на миокард.",
                difficulty: "medium"
            },
            {
                question: "Какова нормальная частота сердечных сокращений у взрослого человека в покое?",
                options: [
                    { text: "40-60 уд/мин", correct: false },
                    { text: "60-100 уд/мин", correct: true },
                    { text: "100-120 уд/мин", correct: false },
                    { text: "120-140 уд/мин", correct: false }
                ],
                explanation: "Нормальная ЧСС у взрослого составляет 60-100 ударов в минуту. Тахикардия - более 100 уд/мин, брадикардия - менее 60 уд/мин. У тренированных спортсменов в покое ЧСС может быть 40-60 уд/мин как вариант нормы.",
                difficulty: "easy"
            },
            {
                question: "Какой антибиотик противопоказан при беременности?",
                options: [
                    { text: "Пенициллин", correct: false },
                    { text: "Цефтриаксон", correct: false },
                    { text: "Доксициклин", correct: true },
                    { text: "Азитромицин", correct: false }
                ],
                explanation: "Доксициклин противопоказан при беременности, так как относится к тетрациклинам, которые проникают через плаценту и могут вызывать нарушение формирования костной ткани и дисколорацию зубов у плода. Также тетрациклины гепатотоксичны для беременной.",
                difficulty: "medium"
            },
            {
                question: "Какова нормальная концентрация глюкозы в крови натощак?",
                options: [
                    { text: "2.8-3.9 ммоль/л", correct: false },
                    { text: "3.9-5.5 ммоль/л", correct: false },
                    { text: "3.9-6.1 ммоль/л", correct: true },
                    { text: "6.1-7.0 ммоль/л", correct: false }
                ],
                explanation: "Нормальная глюкоза натощак: 3.9-6.1 ммоль/л. Уровень 6.1-6.9 ммоль/л расценивается как нарушение гликемии натощак (предиабет), а ≥7.0 ммоль/л - как сахарный диабет (при подтверждении повторным исследованием).",
                difficulty: "easy"
            },
            {
                question: "Какой витамин назначают для профилактики дефектов нервной трубки у плода?",
                options: [
                    { text: "Витамин А", correct: false },
                    { text: "Витамин D", correct: false },
                    { text: "Фолиевая кислота", correct: true },
                    { text: "Витамин В12", correct: false }
                ],
                explanation: "Фолиевая кислота (витамин B9) назначается для профилактики дефектов нервной трубки у плода. Рекомендуемая доза - 400-800 мкг/сут за 1-3 месяца до планируемой беременности и в течение первого триместра. Дефицит фолиевой кислоты ассоциирован с развитием spina bifida, анэнцефалии и других пороков развития.",
                difficulty: "medium"
            }
        ];

        return questionBank.slice(0, count);
    }

    showQuizInterface() {
        this.showElement('#quizContainer');
        this.hideElement('#quizResults');
    }

    displayQuestion(index) {
        if (index >= this.quizState.questions.length) {
            this.finishQuiz();
            return;
        }

        const question = this.quizState.questions[index];
        this.updateElementText('#quizQuestion', question.question);
        this.updateElementText('#currentQuestion', index + 1);
        this.updateElementText('#totalQuestions', this.quizState.questions.length);

        // Display options
        const optionsContainer = this.getElement('#quizOptions');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            if (this.quizState.userAnswers[index] === optionIndex) {
                optionElement.classList.add('selected');
            }
            
            optionElement.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + optionIndex)}</div>
                <div class="option-text">${option.text}</div>
            `;
            
            optionElement.addEventListener('click', () => {
                this.selectAnswer(index, optionIndex);
            });
            
            optionsContainer.appendChild(optionElement);
        });

        this.getElement('#nextQuestion').disabled = this.quizState.userAnswers[index] === -1;
        this.hideElement('#quizExplanation');
    }

    selectAnswer(questionIndex, answerIndex) {
        this.quizState.userAnswers[questionIndex] = answerIndex;
        
        const options = document.querySelectorAll('.option');
        options.forEach((option, index) => {
            option.classList.remove('selected');
            if (index === answerIndex) {
                option.classList.add('selected');
            }
        });

        this.getElement('#nextQuestion').disabled = false;
    }

    startQuizTimer() {
        this.updateQuizTimer();
        this.quizState.timer = setInterval(() => {
            this.quizState.timeLeft--;
            this.updateQuizTimer();
            
            if (this.quizState.timeLeft <= 0) {
                this.finishQuiz();
            }
        }, 1000);
    }

    updateQuizTimer() {
        const minutes = Math.floor(this.quizState.timeLeft / 60);
        const seconds = this.quizState.timeLeft % 60;
        this.updateElementText('#quizTimer', 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    nextQuestion() {
        if (this.quizState.currentQuestion < this.quizState.questions.length - 1) {
            this.quizState.currentQuestion++;
            this.displayQuestion(this.quizState.currentQuestion);
        } else {
            this.finishQuiz();
        }
    }

    prevQuestion() {
        if (this.quizState.currentQuestion > 0) {
            this.quizState.currentQuestion--;
            this.displayQuestion(this.quizState.currentQuestion);
        }
    }

    skipQuestion() {
        if (this.quizState.currentQuestion < this.quizState.questions.length - 1) {
            this.quizState.currentQuestion++;
            this.displayQuestion(this.quizState.currentQuestion);
        }
    }

    finishQuiz() {
        if (this.quizState.timer) {
            clearInterval(this.quizState.timer);
        }
        
        let correctAnswers = 0;
        this.quizState.userAnswers.forEach((answer, index) => {
            if (answer !== -1 && this.quizState.questions[index].options[answer].correct) {
                correctAnswers++;
            }
        });
        
        const total = this.quizState.questions.length;
        const percentage = Math.round((correctAnswers / total) * 100);
        
        // Update stats
        this.userStats.theories.completed += total;
        this.userStats.theories.correct += correctAnswers;
        this.currentXP += correctAnswers * 10;
        
        // Update daily progress
        this.dailyProgress.questions += total;
        this.updateDailyProgress();
        
        // Show detailed results
        this.showDetailedQuizResults();
        
        this.showToast(`Тест завершен! Результат: ${correctAnswers}/${total}`, 'success');
        this.updateAllDisplays();
    }

    // Новый метод для показа детальных результатов с объяснениями
    showDetailedQuizResults() {
        const resultsContainer = this.getElement('#quizResults');
        if (!resultsContainer) return;

        let resultsHTML = `
            <div class="results-card">
                <h3>Тест завершен!</h3>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <div class="stat-value" id="correctAnswers">${this.quizState.userAnswers.filter((answer, index) => 
                            answer !== -1 && this.quizState.questions[index].options[answer].correct).length}</div>
                        <div class="stat-label">Правильных ответов</div>
                    </div>
                    <div class="result-stat">
                        <div class="stat-value" id="totalQuestionsResult">${this.quizState.questions.length}</div>
                        <div class="stat-label">Всего вопросов</div>
                    </div>
                    <div class="result-stat">
                        <div class="stat-value" id="successRate">${Math.round((this.quizState.userAnswers.filter((answer, index) => 
                            answer !== -1 && this.quizState.questions[index].options[answer].correct).length / this.quizState.questions.length) * 100)}%</div>
                        <div class="stat-label">Успешность</div>
                    </div>
                </div>

                <div class="results-xp">
                    <i class="fas fa-star"></i>
                    Получено <strong id="earnedXP">${this.quizState.userAnswers.filter((answer, index) => 
                        answer !== -1 && this.quizState.questions[index].options[answer].correct).length * 10}</strong> XP
                </div>

                <div class="detailed-results" style="margin-top: 30px; text-align: left;">
                    <h4 style="margin-bottom: 20px; color: var(--text-primary);">Детальные результаты:</h4>
        `;

        this.quizState.questions.forEach((question, index) => {
            const userAnswer = this.quizState.userAnswers[index];
            const isCorrect = userAnswer !== -1 && question.options[userAnswer].correct;
            const userAnswerText = userAnswer !== -1 ? question.options[userAnswer].text : 'Не отвечен';
            const correctAnswerText = question.options.find(opt => opt.correct).text;

            resultsHTML += `
                <div class="question-result" style="margin-bottom: 25px; padding: 20px; background: ${isCorrect ? '#ecfdf5' : '#fef2f2'}; border-radius: var(--radius); border-left: 4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'};">
                    <div class="question-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <h5 style="margin: 0; flex: 1; color: var(--text-primary);">Вопрос ${index + 1}: ${question.question}</h5>
                        <span class="result-badge" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${isCorrect ? 'var(--success)' : 'var(--error)'}; color: white; margin-left: 15px;">
                            ${isCorrect ? 'Правильно' : 'Неправильно'}
                        </span>
                    </div>
                    
                    <div class="answer-comparison" style="margin-bottom: 15px;">
                        <div class="user-answer" style="margin-bottom: 8px;">
                            <strong>Ваш ответ:</strong> 
                            <span style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'};">${userAnswerText}</span>
                        </div>
                        ${!isCorrect ? `
                        <div class="correct-answer">
                            <strong>Правильный ответ:</strong> 
                            <span style="color: var(--success);">${correctAnswerText}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="explanation" style="background: white; padding: 15px; border-radius: var(--radius); border: 1px solid var(--border);">
                        <h6 style="margin: 0 0 10px 0; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-lightbulb"></i> Теоретическое обоснование
                        </h6>
                        <p style="margin: 0; line-height: 1.5; color: var(--text-primary);">${question.explanation}</p>
                    </div>
                </div>
            `;
        });

        resultsHTML += `
                </div>

                <button class="button primary" id="restartQuiz" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> Пройти еще раз
                </button>
            </div>
        `;

        resultsContainer.innerHTML = resultsHTML;
        
        // Re-attach event listener
        this.getElement('#restartQuiz')?.addEventListener('click', () => this.startRandomQuiz());
        
        this.hideElement('#quizContainer');
        this.showElement('#quizResults');
    }

    // Stations Section
    initializeStations() {
        this.renderStationsGrid();
    }

    renderStationsGrid() {
        const stationsGrid = this.getElement('#stationsGrid');
        if (!stationsGrid) return;

        const stations = [
            {
                id: 'history',
                name: 'Сбор жалоб и анамнеза',
                time: '8 минут',
                description: 'Стандартизированный сбор информации у пациента',
                icon: 'comment-medical',
                available: true
            },
            {
                id: 'cpr',
                name: 'СЛР - Сердечно-лёгочная реанимация',
                time: '10 минут',
                description: 'Отработка навыков сердечно-лёгочной реанимации взрослого пациента',
                icon: 'heartbeat',
                available: false
            },
            {
                id: 'emergency',
                name: 'Неотложная помощь',
                time: '15 минут',
                description: 'Алгоритм оказания неотложной помощи при анафилактическом шоке',
                icon: 'ambulance',
                available: false
            },
            {
                id: 'examination',
                name: 'Физикальное обследование',
                time: '12 минут',
                description: 'Обследование сердечно-сосудистой и дыхательной систем',
                icon: 'stethoscope',
                available: false
            }
        ];

        stationsGrid.innerHTML = stations.map(station => {
            const isCompleted = this.userStats.stations.scores[station.id] !== undefined;
            const practiceCount = this.userStats.stations.practiceCount[station.id] || 0;
            const statusClass = station.available ? 'available' : 'coming-soon';
            const statusText = station.available ? 'Доступно' : 'Скоро появится';
            
            return `
                <div class="station-card ${statusClass}" data-station="${station.id}">
                    <div class="station-header">
                        <div class="station-icon">
                            <i class="fas fa-${station.icon}"></i>
                        </div>
                        <div class="station-info">
                            <h3>${station.name}</h3>
                            <span class="station-time">${station.time}</span>
                        </div>
                        <span class="completion-badge ${isCompleted ? 'completed' : 'not-started'}">
                            ${isCompleted ? 'Освоено' : 'Не начато'}
                        </span>
                    </div>
                    <p>${station.description}</p>
                    <div class="station-stats">
                        <span>Отработано: ${practiceCount} раз</span>
                        ${isCompleted ? `<span>Лучший результат: ${this.userStats.stations.scores[station.id]}/25</span>` : ''}
                    </div>
                    <div class="station-status ${statusClass}">${statusText}</div>
                </div>
            `;
        }).join('');

        // Add event listeners
        this.attachStationEventListeners();
    }

    attachStationEventListeners() {
        document.querySelectorAll('.station-card.available').forEach(card => {
            card.addEventListener('click', (e) => {
                const stationId = card.getAttribute('data-station');
                this.startStationPractice(stationId);
            });
        });

        document.querySelectorAll('.station-card.coming-soon').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Эта станция появится в ближайшее время!', 'info');
            });
        });
    }

    startStationPractice(stationId) {
        if (stationId === 'history') {
            this.startHistoryStation();
        }
    }

    startHistoryStation() {
        const station = {
            name: 'Сбор жалоб и анамнеза',
            description: 'Стандартизированный сбор информации у пациента. Время выполнения: 8 минут. Максимальный балл: 15.',
            checklist: [
                "Поздороваться",
                "Позаботиться о комфорте пациента",
                "Представиться пациенту по имени и отчеству",
                "Объяснить свою роль",
                "Попросить пациента представиться",
                "Начать сбор информации с общего, а не конкретного вопроса",
                "Дослушивать ответы пациента до конца, не перебивая уточняющими вопросами",
                "Резюмировать сказанное пациентом",
                "Проверить наличие других проблем или поводов для обращения",
                "Задать серии вопросов",
                "Поддерживать зрительный контакт",
                "Обозначить готовность завершить опрос и перейти к осмотру пациента",
                "Назвать вслух список проблем/жалоб пациента",
                "Назвать вслух свои клинические гипотезы",
                "Оформить результаты опроса в заключении"
            ]
        };

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3>${station.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="practice-content">
                        <div class="practice-tools">
                            <div class="video-container">
                                <iframe 
                                    src="${this.videoUrl}" 
                                    width="100%" 
                                    height="400" 
                                    frameborder="0" 
                                    allow="autoplay; encrypted-media" 
                                    allowfullscreen>
                                </iframe>
                                <div class="video-description">
                                    Обучающее видео по сбору жалоб и анамнеза
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                                <div class="timer-section">
                                    <h4>Таймер</h4>
                                    <div class="timer-display" id="stationTimer">08:00</div>
                                    <div class="timer-controls">
                                        <button class="button primary" id="startTimer">Старт</button>
                                        <button class="button secondary" id="resetTimer">Сброс</button>
                                    </div>
                                </div>
                                <div class="scoring-section">
                                    <h4>Результат</h4>
                                    <div class="score-display">
                                        <span>Набрано баллов:</span>
                                        <strong id="stationScore">0/15</strong>
                                    </div>
                                    <button class="button primary" id="submitStation" style="width: 100%; margin-top: 10px;">Завершить станцию</button>
                                </div>
                            </div>
                        </div>
                        <div class="checklist-section">
                            <h4>Чек-лист выполнения (15 пунктов)</h4>
                            <div class="checklist" id="stationChecklist">
                                ${station.checklist.map((item, index) => `
                                    <div class="checklist-item">
                                        <input type="checkbox" id="check-${index}">
                                        <label for="check-${index}">${index + 1}. ${item}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initializeStationTimer();
        this.attachStationModalListeners(modal, station);
    }

    initializeStationTimer() {
        this.stationTimeLeft = 480;
        this.updateStationTimerDisplay();
    }

    attachStationModalListeners(modal, station) {
        const closeBtn = modal.querySelector('.modal-close');
        const startTimerBtn = modal.querySelector('#startTimer');
        const resetTimerBtn = modal.querySelector('#resetTimer');
        const submitBtn = modal.querySelector('#submitStation');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        closeBtn.addEventListener('click', () => {
            modal.remove();
            if (this.stationTimer) clearInterval(this.stationTimer);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (this.stationTimer) clearInterval(this.stationTimer);
            }
        });

        startTimerBtn.addEventListener('click', () => {
            this.startStationTimer();
        });

        resetTimerBtn.addEventListener('click', () => {
            this.resetStationTimer();
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateStationScore(modal);
            });
        });

        submitBtn.addEventListener('click', () => {
            this.submitStationPractice(station, modal);
        });
    }

    startStationTimer() {
        if (this.stationTimer) clearInterval(this.stationTimer);

        this.stationTimer = setInterval(() => {
            this.stationTimeLeft--;
            this.updateStationTimerDisplay();
            
            if (this.stationTimeLeft <= 0) {
                clearInterval(this.stationTimer);
                this.showToast('Время вышло!', 'info');
            }
        }, 1000);
    }

    resetStationTimer() {
        if (this.stationTimer) clearInterval(this.stationTimer);
        this.stationTimeLeft = 480;
        this.updateStationTimerDisplay();
    }

    updateStationTimerDisplay() {
        const minutes = Math.floor(this.stationTimeLeft / 60);
        const seconds = this.stationTimeLeft % 60;
        const timerElement = document.querySelector('#stationTimer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateStationScore(modal) {
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
        const score = checkboxes.length;
        const scoreElement = modal.querySelector('#stationScore');
        if (scoreElement) {
            scoreElement.innerHTML = `<strong>${score}/15</strong>`;
        }
    }

    submitStationPractice(station, modal) {
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
        const score = checkboxes.length;
        
        // Update stats
        if (!this.userStats.stations.practiceCount.history) {
            this.userStats.stations.practiceCount.history = 0;
        }
        this.userStats.stations.practiceCount.history++;
        
        if (!this.userStats.stations.scores.history || score > this.userStats.stations.scores.history) {
            if (!this.userStats.stations.scores.history) {
                this.userStats.stations.completed++;
            }
            this.userStats.stations.scores.history = score;
        }
        
        // Award XP
        const xpEarned = score * 5;
        this.currentXP += xpEarned;
        
        modal.remove();
        if (this.stationTimer) clearInterval(this.stationTimer);
        
        this.showToast(`Станция завершена! Набрано баллов: ${score}/15`, 'success');
        this.renderStationsGrid();
        this.updateAllDisplays();
    }

    // Tasks Section
    initializeTasks() {
        this.attachTaskEventListeners();
    }

    attachTaskEventListeners() {
        document.querySelectorAll('.task-card.available').forEach(card => {
            card.addEventListener('click', (e) => {
                const taskId = card.getAttribute('data-task');
                if (taskId === 'copd') {
                    this.startCOPDTask();
                }
            });
        });

        document.querySelectorAll('.task-card.coming-soon').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Эта задача появится в ближайшее время!', 'info');
            });
        });
    }

    startCOPDTask() {
        const task = {
            name: 'ХОБЛ - диагностика и лечение',
            description: 'Пациент 54 лет. Жалобы на одышку при физической нагрузке средней интенсивности, кашель с небольшим количеством мокроты, быструю утомляемость. Кашель беспокоит в течение 10 лет, ухудшения состояния отмечает весной и осенью. Последние полгода отмечает одышку при физической нагрузке. Курит в течение 20 лет до 15-20 сигарет в день.',
            timeLimit: 1800, // 30 minutes
            questions: [
                {
                    question: "Необходимым для постановки диагноза лабораторным методом обследования является:",
                    options: [
                        "исследование уровня креатинина",
                        "исследование уровня общего билирубина", 
                        "исследование уровня глюкозы",
                        "общий (клинический) анализ крови развернутый"
                    ],
                    correct: 3,
                    explanation: "Общий анализ крови необходим для оценки воспалительного процесса и исключения анемии как причины одышки. При ХОБЛ может наблюдаться полицитемия как компенсаторная реакция на хроническую гипоксию.",
                    results: "Результаты общего анализа крови: Эритроциты - 5.8×10¹²/л (норма 4.0-5.1), Гемоглобин - 178 г/л (норма 130-160), Лейкоциты - 8.9×10⁹/л (норма 4.0-9.0). Отмечается компенсаторный эритроцитоз."
                },
                {
                    question: "К необходимым для постановки диагноза инструментальным методам обследования относят (выберите 3 правильных ответа):",
                    options: [
                        "пульсоксиметрию",
                        "спирометрию", 
                        "коронарографию",
                        "рентгенографию органов грудной клетки",
                        "трансторакальную эхокардиографию",
                        "электрокардиографию (ЭКГ)"
                    ],
                    correct: [1, 3, 5],
                    explanation: "Спирометрия - золотой стандарт диагностики ХОБЛ, позволяет оценить степень обструкции. Рентгенография исключает другие патологии легких (пневмонию, опухоли). ЭКГ оценивает состояние сердца и исключает кардиальные причины одышки.",
                    results: "Спирометрия: ОФВ1/ФЖЕЛ = 58% (норма >70%), ОФВ1 = 65% от должного. Рентгенография: признаки эмфиземы - уплощение куполов диафрагмы, увеличение ретростернального пространства. ЭКГ: признаки гипертрофии правого желудочка."
                },
                {
                    question: "На основании представленных данных установите предварительный диагноз:",
                    options: [
                        "Бронхиальная астма",
                        "Хроническая обструктивная болезнь лёгких", 
                        "Хронический бронхит",
                        "Интерстициальная болезнь лёгких"
                    ],
                    correct: 1,
                    explanation: "Клиническая картина (длительный кашель, прогрессирующая одышка, курение в анамнезе) и данные спирометрии (необратимая обструкция) характерны для ХОБЛ.",
                    results: "Диагноз: ХОБЛ, стадия 2 (средней степени тяжести) по GOLD."
                }
            ]
        };

        this.showTaskInterface(task);
    }

    showTaskInterface(task) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>${task.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="task-timer">
                    <div class="timer-display" id="taskTimer">30:00</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                        Осталось времени на решение задачи
                    </div>
                </div>
                <div class="modal-body">
                    <div class="task-scenario">
                        <h4>Клиническая ситуация</h4>
                        <p>${task.description}</p>
                    </div>
                    <div id="taskQuestionsContainer"></div>
                    <div class="task-results-container" id="taskResultsContainer" style="display: none;"></div>
                    <div class="task-actions" style="margin-top: 20px;">
                        <button class="button secondary" id="prevTaskQuestion">Назад</button>
                        <button class="button primary" id="nextTaskQuestion">Далее</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.currentTask = {
            ...task,
            currentQuestion: 0,
            userAnswers: new Array(task.questions.length).fill(null),
            modal: modal,
            timeLeft: task.timeLimit,
            timer: null,
            showResults: false // Флаг для показа результатов
        };
        
        this.startTaskTimer();
        this.displayTaskQuestion(0);
        this.attachTaskModalListeners(modal);
    }

    displayTaskQuestion(index) {
        const container = this.currentTask.modal.querySelector('#taskQuestionsContainer');
        const resultsContainer = this.currentTask.modal.querySelector('#taskResultsContainer');
        const question = this.currentTask.questions[index];
        
        // Скрываем результаты при переходе к новому вопросу
        resultsContainer.style.display = 'none';
        container.style.display = 'block';
        this.currentTask.showResults = false;
        
        let optionsHTML = '';
        if (Array.isArray(question.correct)) {
            optionsHTML = question.options.map((option, optIndex) => {
                const isChecked = this.currentTask.userAnswers[index]?.includes(optIndex);
                return `
                    <label class="task-option" style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; margin-bottom: 8px;">
                        <input type="checkbox" name="question-${index}" value="${optIndex}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px;">
                        <span>${option}</span>
                    </label>
                `;
            }).join('');
        } else {
            const currentAnswer = this.currentTask.userAnswers[index];
            optionsHTML = question.options.map((option, optIndex) => {
                const isChecked = currentAnswer === optIndex;
                return `
                    <label class="task-option" style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; margin-bottom: 8px;">
                        <input type="radio" name="question-${index}" value="${optIndex}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px;">
                        <span>${option}</span>
                    </label>
                `;
            }).join('');
        }
        
        container.innerHTML = `
            <div class="task-question" style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #2563eb;">Вопрос ${index + 1} из ${this.currentTask.questions.length}</h4>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">${question.question}</p>
                <div class="task-options">
                    ${optionsHTML}
                </div>
            </div>
        `;
        
        this.updateTaskNavigation();
        
        // Добавляем обработчики для вариантов ответов
        this.attachTaskOptionListeners(index);
    }

    attachTaskOptionListeners(questionIndex) {
        const container = this.currentTask.modal.querySelector('#taskQuestionsContainer');
        const question = this.currentTask.questions[questionIndex];
        
        if (Array.isArray(question.correct)) {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.saveCurrentAnswer();
                    this.showTaskResultsAfterAnswer(questionIndex);
                });
            });
        } else {
            const radios = container.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.saveCurrentAnswer();
                    this.showTaskResultsAfterAnswer(questionIndex);
                });
            });
        }
    }

    showTaskResultsAfterAnswer(questionIndex) {
        const container = this.currentTask.modal.querySelector('#taskQuestionsContainer');
        const resultsContainer = this.currentTask.modal.querySelector('#taskResultsContainer');
        const question = this.currentTask.questions[questionIndex];
        
        if (!this.currentTask.showResults && this.currentTask.userAnswers[questionIndex] !== null) {
            // Показываем результаты обследования
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `
                <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--radius); margin-top: 15px; border-left: 4px solid var(--primary);">
                    <h6 style="margin: 0 0 10px 0; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-file-medical-alt"></i> Результаты обследования
                    </h6>
                    <p style="margin: 0; line-height: 1.5; color: var(--text-primary); font-family: 'Courier New', monospace; font-size: 14px;">${question.results}</p>
                </div>
            `;
            
            this.currentTask.showResults = true;
        }
    }

    attachTaskModalListeners(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        const prevBtn = modal.querySelector('#prevTaskQuestion');
        const nextBtn = modal.querySelector('#nextTaskQuestion');

        closeBtn.addEventListener('click', () => {
            if (this.currentTask.timer) clearInterval(this.currentTask.timer);
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (this.currentTask.timer) clearInterval(this.currentTask.timer);
                modal.remove();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (this.currentTask.currentQuestion > 0) {
                this.saveCurrentAnswer();
                this.currentTask.currentQuestion--;
                this.displayTaskQuestion(this.currentTask.currentQuestion);
            }
        });

        nextBtn.addEventListener('click', () => {
            this.saveCurrentAnswer();
            
            if (this.currentTask.currentQuestion < this.currentTask.questions.length - 1) {
                this.currentTask.currentQuestion++;
                this.displayTaskQuestion(this.currentTask.currentQuestion);
            } else {
                this.finishTask();
            }
        });
    }

    saveCurrentAnswer() {
        const currentIndex = this.currentTask.currentQuestion;
        const container = this.currentTask.modal.querySelector('#taskQuestionsContainer');
        
        if (Array.isArray(this.currentTask.questions[currentIndex].correct)) {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
            this.currentTask.userAnswers[currentIndex] = Array.from(checkboxes).map(cb => parseInt(cb.value));
        } else {
            const radio = container.querySelector('input[type="radio"]:checked');
            this.currentTask.userAnswers[currentIndex] = radio ? parseInt(radio.value) : null;
        }
    }

    updateTaskNavigation() {
        const prevBtn = this.currentTask.modal.querySelector('#prevTaskQuestion');
        const nextBtn = this.currentTask.modal.querySelector('#nextTaskQuestion');
        
        prevBtn.disabled = this.currentTask.currentQuestion === 0;
        nextBtn.textContent = this.currentTask.currentQuestion === this.currentTask.questions.length - 1 ? 
            'Завершить' : 'Далее';
    }

    startTaskTimer() {
        this.updateTaskTimer();
        this.currentTask.timer = setInterval(() => {
            this.currentTask.timeLeft--;
            this.updateTaskTimer();
            
            if (this.currentTask.timeLeft <= 0) {
                this.finishTask();
            }
        }, 1000);
    }

    updateTaskTimer() {
        const minutes = Math.floor(this.currentTask.timeLeft / 60);
        const seconds = this.currentTask.timeLeft % 60;
        const timerElement = this.currentTask.modal.querySelector('#taskTimer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.currentTask.timeLeft < 300) { // 5 minutes warning
                timerElement.classList.add('timer-warning');
            }
        }
    }

    finishTask() {
        if (this.currentTask.timer) {
            clearInterval(this.currentTask.timer);
        }
        
        let correctAnswers = 0;
        let totalQuestions = this.currentTask.questions.length;
        
        this.currentTask.userAnswers.forEach((answer, index) => {
            const question = this.currentTask.questions[index];
            if (Array.isArray(question.correct)) {
                if (answer && answer.length === question.correct.length && 
                    answer.every(val => question.correct.includes(val))) {
                    correctAnswers++;
                }
            } else {
                if (answer === question.correct) {
                    correctAnswers++;
                }
            }
        });
        
        // Показываем детальные результаты
        this.showDetailedTaskResults(correctAnswers, totalQuestions);
    }

    // Новый метод для показа детальных результатов задачи
    showDetailedTaskResults(correctAnswers, totalQuestions) {
        const modal = this.currentTask.modal;
        
        let resultsHTML = `
            <div class="task-results-detailed" style="text-align: left;">
                <h3 style="text-align: center; margin-bottom: 20px; color: var(--text-primary);">Результаты решения задачи</h3>
                
                <div class="results-summary" style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius); margin-bottom: 25px; text-align: center;">
                    <div style="font-size: 18px; margin-bottom: 10px;">
                        Правильных ответов: <strong style="color: ${correctAnswers >= 2 ? 'var(--success)' : 'var(--error)'};">${correctAnswers}/${totalQuestions}</strong>
                    </div>
                    <div style="font-size: 16px; color: var(--text-secondary);">
                        ${correctAnswers >= 2 ? 'Задача успешно решена!' : 'Попробуйте еще раз!'}
                    </div>
                </div>

                <div class="detailed-answers">
                    <h4 style="margin-bottom: 20px; color: var(--text-primary);">Детальный разбор:</h4>
        `;

        this.currentTask.questions.forEach((question, index) => {
            const userAnswer = this.currentTask.userAnswers[index];
            let isCorrect = false;
            
            if (Array.isArray(question.correct)) {
                isCorrect = userAnswer && userAnswer.length === question.correct.length && 
                           userAnswer.every(val => question.correct.includes(val));
            } else {
                isCorrect = userAnswer === question.correct;
            }

            const userAnswerText = userAnswer !== null ? 
                (Array.isArray(userAnswer) ? 
                    userAnswer.map(opt => question.options[opt].text).join(', ') : 
                    question.options[userAnswer].text) : 
                'Не отвечен';

            const correctAnswerText = Array.isArray(question.correct) ?
                question.correct.map(opt => question.options[opt].text).join(', ') :
                question.options[question.correct].text;

            resultsHTML += `
                <div class="question-review" style="margin-bottom: 25px; padding: 20px; background: ${isCorrect ? '#ecfdf5' : '#fef2f2'}; border-radius: var(--radius); border-left: 4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'};">
                    <div class="question-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <h5 style="margin: 0; flex: 1; color: var(--text-primary);">Вопрос ${index + 1}: ${question.question}</h5>
                        <span class="result-badge" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${isCorrect ? 'var(--success)' : 'var(--error)'}; color: white; margin-left: 15px;">
                            ${isCorrect ? 'Правильно' : 'Неправильно'}
                        </span>
                    </div>
                    
                    <div class="answer-comparison" style="margin-bottom: 15px;">
                        <div class="user-answer" style="margin-bottom: 8px;">
                            <strong>Ваш ответ:</strong> 
                            <span style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'};">${userAnswerText}</span>
                        </div>
                        ${!isCorrect ? `
                        <div class="correct-answer" style="margin-bottom: 8px;">
                            <strong>Правильный ответ:</strong> 
                            <span style="color: var(--success);">${correctAnswerText}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${question.results ? `
                    <div class="exam-results" style="background: white; padding: 12px; border-radius: var(--radius); margin-bottom: 12px; border: 1px solid var(--border);">
                        <strong style="color: var(--primary);">Результаты обследования:</strong>
                        <p style="margin: 8px 0 0 0; font-family: 'Courier New', monospace; font-size: 13px;">${question.results}</p>
                    </div>
                    ` : ''}
                    
                    <div class="explanation" style="background: white; padding: 15px; border-radius: var(--radius); border: 1px solid var(--border);">
                        <h6 style="margin: 0 0 10px 0; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-lightbulb"></i> Обоснование
                        </h6>
                        <p style="margin: 0; line-height: 1.5; color: var(--text-primary);">${question.explanation}</p>
                    </div>
                </div>
            `;
        });

        resultsHTML += `
                </div>
                
                <div class="task-actions" style="text-align: center; margin-top: 25px;">
                    <button class="button primary" id="closeTaskResults">
                        Закрыть
                    </button>
                </div>
            </div>
        `;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = resultsHTML;

        // Обновляем статистику
        this.userStats.tasks.completed++;
        this.userStats.tasks.correct += correctAnswers;
        
        // Award XP
        const xpEarned = correctAnswers * 10;
        this.currentXP += xpEarned;

        // Добавляем обработчик закрытия
        modal.querySelector('#closeTaskResults').addEventListener('click', () => {
            modal.remove();
            this.showToast(`Задача завершена! Правильных ответов: ${correctAnswers}/${totalQuestions}`, 
                          correctAnswers >= 2 ? 'success' : 'info');
            this.updateAllDisplays();
        });
    }

    // Quick Actions
    initializeQuickActions() {
        this.getElement('#quickTheory')?.addEventListener('click', () => {
            this.startRandomQuiz();
        });

        this.getElement('#quickStation')?.addEventListener('click', () => {
            this.startHistoryStation();
        });

        this.getElement('#quickTask')?.addEventListener('click', () => {
            this.startCOPDTask();
        });

        this.getElement('#quickProgress')?.addEventListener('click', () => {
            this.switchToTab('progress');
        });

        // Daily challenge
        this.getElement('#startDailyChallenge')?.addEventListener('click', () => {
            this.startRandomQuiz();
        });
    }

    // Daily Challenge
    checkDailyChallenge() {
        const today = new Date().toDateString();
        if (this.dailyProgress.lastCompleted !== today) {
            this.dailyProgress.questions = 0;
            this.dailyProgress.completed = false;
            this.dailyProgress.lastCompleted = today;
        }
        this.updateDailyProgress();
    }

    updateDailyProgress() {
        const dailyGoal = 20;
        const progress = Math.min(this.dailyProgress.questions, dailyGoal);
        const percentage = Math.round((progress / dailyGoal) * 100);
        
        this.updateProgressBar('#dailyProgress', percentage);
        this.updateElementText('#dailyProgressText', `${progress}/${dailyGoal}`);
    }

    // Exam Progress
    initializeExamProgress() {
        this.updateExamProgress();
    }

    updateExamProgress() {
        // Basic implementation
        const steps = document.querySelectorAll('.progress-steps .step');
        steps.forEach((step, index) => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            if (stepNumber === 1 && this.userStats.theories.completed > 0) {
                step.classList.add('active');
            }
        });
    }

    updateProgressTab() {
        // Basic implementation
        this.updateElementText('#progressTheoriesCompleted', this.userStats.theories.completed);
        this.updateElementText('#progressStationsCompleted', this.userStats.stations.completed);
        this.updateElementText('#progressTasksCompleted', this.userStats.tasks.completed);
        
        // Calculate accuracy percentages
        const theoryAccuracy = this.userStats.theories.completed > 0 ? 
            Math.round((this.userStats.theories.correct / this.userStats.theories.completed) * 100) : 0;
        const taskAccuracy = this.userStats.tasks.completed > 0 ? 
            Math.round((this.userStats.tasks.correct / this.userStats.tasks.completed) * 100) : 0;
        
        this.updateElementText('#progressTheoriesAccuracy', `${theoryAccuracy}%`);
        this.updateElementText('#progressTasksAccuracy', `${taskAccuracy}%`);
        
        // Calculate average station score
        const stationScores = Object.values(this.userStats.stations.scores);
        const averageScore = stationScores.length > 0 ? 
            Math.round(stationScores.reduce((a, b) => a + b, 0) / stationScores.length) : 0;
        this.updateElementText('#progressStationsScore', averageScore);
        
        // Update overall progress
        const totalProgress = Math.round((
            (this.userStats.theories.completed / this.userStats.theories.total) +
            (this.userStats.stations.completed / this.userStats.stations.total) +
            (this.userStats.tasks.completed / this.userStats.tasks.total)
        ) / 3 * 100);
        
        this.updateProgressBar('#overallProgress', totalProgress);
        this.updateElementText('#overallProgressText', `${totalProgress}%`);
    }

    // Utility Methods
    showToast(message, type = 'info') {
        const toastContainer = this.getElement('#toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getElement(selector) {
        return document.querySelector(selector);
    }

    updateElementText(selector, text) {
        const element = this.getElement(selector);
        if (element) element.textContent = text;
    }

    updateProgressBar(selector, percentage) {
        const element = this.getElement(selector);
        if (element) element.style.width = `${percentage}%`;
    }

    showElement(selector) {
        const element = this.getElement(selector);
        if (element) element.classList.remove('hidden');
    }

    hideElement(selector) {
        const element = this.getElement(selector);
        if (element) element.classList.add('hidden');
    }

    switchToTab(tabName) {
        const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
        if (tab) tab.click();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.medMateApp = new MedMateApp();
});
