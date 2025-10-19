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
        
        // Инициализация состояний
        this.quizState = {
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: [],
            timeLeft: 1800,
            timer: null
        };
        
        this.taskState = {
            currentTask: null,
            currentStep: 1,
            userAnswers: [],
            score: 0
        };
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadProgress();
        this.initializeEventListeners();
        this.updateAllDisplays();
        this.checkDailyChallenge();
        this.updateContentForUserType();
    }

    initializeEventListeners() {
        // Навигация по вкладкам
        this.initializeTabs();
        
        // Пользовательские настройки
        this.initializeUserType();
        
        // Тесты
        this.initializeTheory();
        
        // Станции
        this.initializeStations();
        
        // Задачи
        this.initializeTasks();
        
        // Быстрые действия
        this.initializeQuickActions();
        
        // Мобильные функции
        this.initializeMobileFeatures();
        
        // Профиль
        this.initializeProfile();
        
        // Прогресс экзамена
        this.initializeExamProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('medmate_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentXP = data.currentXP || 0;
                this.currentLevel = data.currentLevel || 1;
                this.userStats = data.userStats || this.userStats;
                this.achievements = data.achievements || this.achievements;
                this.dailyProgress = data.dailyProgress || this.dailyProgress;
                this.progressHistory = data.progressHistory || [];
                
            } catch (e) {
                console.error('Error loading progress:', e);
            }
        }
    }

    saveProgress() {
        const data = {
            currentXP: this.currentXP,
            currentLevel: this.currentLevel,
            userStats: this.userStats,
            achievements: this.achievements,
            dailyProgress: this.dailyProgress,
            progressHistory: this.progressHistory
        };
        localStorage.setItem('medmate_progress', JSON.stringify(data));
    }

    initializeTabs() {
        console.log('Initializing tabs...');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.getAttribute('data-tab');
                console.log('Tab clicked:', targetTab);
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show target content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                        console.log('Showing tab:', targetTab);
                    }
                });

                // Special handling for progress tab
                if (targetTab === 'progress') {
                    this.updateProgressTab();
                }

                this.showToast('Переход выполнен успешно!', 'success');
            });
        });
    }

    initializeUserType() {
        const userTypeSelect = document.getElementById('userType');
        if (userTypeSelect) {
            userTypeSelect.value = this.userType;
            
            userTypeSelect.addEventListener('change', (e) => {
                this.userType = e.target.value;
                this.updateContentForUserType();
                this.updateAllDisplays();
                this.showToast(`Режим изменен: ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });
        }
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

    // ========== ТЕСТЫ ==========

    initializeTheory() {
        console.log('Initializing theory...');
        
        const startTestBtn = document.getElementById('startRandomTest');
        const skipQuestionBtn = document.getElementById('skipQuestion');
        const nextQuestionBtn = document.getElementById('nextQuestion');
        const restartQuizBtn = document.getElementById('restartQuiz');

        if (startTestBtn) {
            startTestBtn.addEventListener('click', () => {
                console.log('Start test clicked');
                this.startRandomTest();
            });
        }

        if (skipQuestionBtn) {
            skipQuestionBtn.addEventListener('click', () => {
                this.skipQuestion();
            });
        }

        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        if (restartQuizBtn) {
            restartQuizBtn.addEventListener('click', () => {
                this.startRandomTest();
            });
        }
    }

    startRandomTest() {
        console.log('Starting random test...');
        this.quizState = {
            questions: this.generateSampleQuestions(20),
            currentQuestionIndex: 0,
            userAnswers: new Array(20).fill(-1),
            timeLeft: 1800,
            timer: null
        };

        const quizContainer = document.getElementById('quizContainer');
        const quizResults = document.getElementById('quizResults');

        if (quizContainer) quizContainer.classList.remove('hidden');
        if (quizResults) quizResults.classList.add('hidden');

        this.startQuizTimer();
        this.showCurrentQuestion();
        
        this.showToast('Тест начат! У вас 30 минут.', 'info');
    }

    generateSampleQuestions(count) {
        const questions = [
            {
                id: 1,
                question: 'Какая доза адреналина используется при сердечно-легочной реанимации у взрослых?',
                options: [
                    { text: '0.1 мг', correct: false },
                    { text: '1 мг', correct: true },
                    { text: '10 мг', correct: false },
                    { text: '0.01 мг', correct: false }
                ],
                difficulty: 'medium',
                explanation: 'При СЛР у взрослых используется адреналин 1 мг внутривенно каждые 3-5 минут.'
            },
            {
                id: 2,
                question: 'Какой антибиотик является препаратом выбора при внебольничной пневмонии?',
                options: [
                    { text: 'Амоксициллин', correct: false },
                    { text: 'Цефтриаксон', correct: false },
                    { text: 'Амоксициллин-клавуланат', correct: true },
                    { text: 'Ципрофлоксацин', correct: false }
                ],
                difficulty: 'medium',
                explanation: 'Амоксициллин-клавуланат рекомендуется как препарат выбора при внебольничной пневмонии.'
            }
        ];

        // Дублируем вопросы чтобы получить нужное количество
        const result = [];
        for (let i = 0; i < count; i++) {
            const original = questions[i % questions.length];
            result.push({
                ...original,
                id: i + 1
            });
        }
        return result;
    }

    startQuizTimer() {
        if (this.quizState.timer) {
            clearInterval(this.quizState.timer);
        }

        this.quizState.timer = setInterval(() => {
            this.quizState.timeLeft--;
            this.updateQuizTimer();

            if (this.quizState.timeLeft <= 0) {
                this.finishQuiz();
            }
        }, 1000);
    }

    updateQuizTimer() {
        const timerElement = document.getElementById('quizTimer');
        if (timerElement) {
            const minutes = Math.floor(this.quizState.timeLeft / 60);
            const seconds = this.quizState.timeLeft % 60;
            timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    showCurrentQuestion() {
        const currentQuestion = this.quizState.questions[this.quizState.currentQuestionIndex];
        
        // Обновляем прогресс
        const currentQuestionElement = document.getElementById('currentQuestion');
        const totalQuestionsElement = document.getElementById('totalQuestions');
        const quizProgressElement = document.getElementById('quizProgress');
        
        if (currentQuestionElement) currentQuestionElement.textContent = this.quizState.currentQuestionIndex + 1;
        if (totalQuestionsElement) totalQuestionsElement.textContent = this.quizState.questions.length;
        
        const progress = ((this.quizState.currentQuestionIndex + 1) / this.quizState.questions.length) * 100;
        if (quizProgressElement) quizProgressElement.style.width = `${progress}%`;

        // Показываем вопрос
        const questionElement = document.getElementById('quizQuestion');
        if (questionElement) questionElement.textContent = currentQuestion.question;
        
        // Обновляем сложность
        const difficultyElement = document.getElementById('questionDifficulty');
        if (difficultyElement) {
            difficultyElement.textContent = this.getDifficultyText(currentQuestion.difficulty);
            difficultyElement.className = `difficulty ${currentQuestion.difficulty}`;
        }

        // Показываем варианты ответов
        const optionsContainer = document.getElementById('quizOptions');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';

            currentQuestion.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                if (this.quizState.userAnswers[this.quizState.currentQuestionIndex] === index) {
                    optionElement.classList.add('selected');
                }

                optionElement.innerHTML = `
                    <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                    <div class="option-text">${option.text}</div>
                `;

                optionElement.addEventListener('click', () => {
                    this.selectAnswer(index);
                });

                optionsContainer.appendChild(optionElement);
            });
        }

        // Скрываем объяснение
        const explanationElement = document.getElementById('quizExplanation');
        if (explanationElement) explanationElement.classList.add('hidden');

        // Обновляем кнопки
        const nextQuestionBtn = document.getElementById('nextQuestion');
        if (nextQuestionBtn) {
            nextQuestionBtn.disabled = this.quizState.userAnswers[this.quizState.currentQuestionIndex] === -1;
        }
    }

    getDifficultyText(difficulty) {
        const difficulties = {
            'easy': 'Легкая',
            'medium': 'Средняя',
            'hard': 'Сложная'
        };
        return difficulties[difficulty] || 'Средняя';
    }

    selectAnswer(answerIndex) {
        this.quizState.userAnswers[this.quizState.currentQuestionIndex] = answerIndex;
        
        const options = document.querySelectorAll('#quizOptions .option');
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === answerIndex);
        });

        const nextQuestionBtn = document.getElementById('nextQuestion');
        if (nextQuestionBtn) nextQuestionBtn.disabled = false;

        this.showExplanation();
    }

    showExplanation() {
        const currentQuestion = this.quizState.questions[this.quizState.currentQuestionIndex];
        const explanationText = document.getElementById('explanationText');
        const explanationElement = document.getElementById('quizExplanation');
        
        if (explanationText) explanationText.textContent = currentQuestion.explanation;
        if (explanationElement) explanationElement.classList.remove('hidden');
    }

    skipQuestion() {
        this.quizState.userAnswers[this.quizState.currentQuestionIndex] = -1;
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.quizState.currentQuestionIndex < this.quizState.questions.length - 1) {
            this.quizState.currentQuestionIndex++;
            this.showCurrentQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        if (this.quizState.timer) {
            clearInterval(this.quizState.timer);
        }
        
        // Calculate results
        let correctAnswers = 0;
        this.quizState.userAnswers.forEach((answer, index) => {
            if (answer !== -1 && this.quizState.questions[index].options[answer].correct) {
                correctAnswers++;
            }
        });
        
        const total = this.quizState.questions.length;
        const percentage = Math.round((correctAnswers / total) * 100);
        
        // Update results display
        const correctAnswersElement = document.getElementById('correctAnswers');
        const totalQuestionsElement = document.getElementById('totalQuestionsResult');
        const successRateElement = document.getElementById('successRate');
        
        if (correctAnswersElement) correctAnswersElement.textContent = correctAnswers;
        if (totalQuestionsElement) totalQuestionsElement.textContent = total;
        if (successRateElement) successRateElement.textContent = `${percentage}%`;
        
        // Calculate XP
        const totalXP = correctAnswers * 10;
        const earnedXPElement = document.getElementById('earnedXP');
        if (earnedXPElement) earnedXPElement.textContent = totalXP;
        
        // Update stats
        this.userStats.theories.completed += total;
        this.userStats.theories.correct += correctAnswers;
        
        this.dailyProgress.questions += total;
        this.updateDailyProgress();
        
        // Show results
        const quizContainer = document.getElementById('quizContainer');
        const quizResults = document.getElementById('quizResults');
        
        if (quizContainer) quizContainer.classList.add('hidden');
        if (quizResults) quizResults.classList.remove('hidden');
        
        this.awardXP(totalXP);
        this.updateAllDisplays();
        
        this.showToast(`Тест завершен! Результат: ${correctAnswers}/${total} (${percentage}%). Получено ${totalXP} XP`, 'success');
    }

    // ========== СТАНЦИИ ==========

    initializeStations() {
        console.log('Initializing stations...');
        this.renderStationsGrid();
        this.initializeStationPractice();
    }

    initializeStationPractice() {
        // Обработчики для кнопок станций
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('practice-station')) {
                const stationCard = e.target.closest('.station-card');
                const stationId = stationCard.getAttribute('data-station');
                this.startStationPractice(stationId);
            }
            
            if (e.target.classList.contains('view-checklist')) {
                const stationCard = e.target.closest('.station-card');
                const stationId = stationCard.getAttribute('data-station');
                this.showChecklist(stationId);
            }
            
            if (e.target.classList.contains('view-video')) {
                const stationCard = e.target.closest('.station-card');
                const stationId = stationCard.getAttribute('data-station');
                this.showTrainingVideo(stationId);
            }
        });

        // Обработчики для практики станций
        const closePracticeBtn = document.getElementById('closePractice');
        const submitStationBtn = document.getElementById('submitStation');
        const startTimerBtn = document.getElementById('startTimer');
        const resetTimerBtn = document.getElementById('resetTimer');

        if (closePracticeBtn) {
            closePracticeBtn.addEventListener('click', () => {
                this.closeStationPractice();
            });
        }

        if (submitStationBtn) {
            submitStationBtn.addEventListener('click', () => {
                this.submitStationPractice();
            });
        }

        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', () => {
                this.startStationTimer();
            });
        }

        if (resetTimerBtn) {
            resetTimerBtn.addEventListener('click', () => {
                this.resetStationTimer();
            });
        }
    }

    renderStationsGrid() {
        const stationsGrid = document.getElementById('stationsGrid');
        if (!stationsGrid) return;

        const stations = [
            {
                id: 'cpr',
                name: 'СЛР',
                time: '10 минут',
                description: 'Сердечно-лёгочная реанимация взрослого и ребёнка',
                icon: 'heartbeat'
            },
            {
                id: 'emergency',
                name: 'Неотложная помощь',
                time: '15 минут',
                description: 'Оказание неотложной помощи при острых состояниях',
                icon: 'ambulance'
            },
            {
                id: 'examination',
                name: 'Физикальное обследование',
                time: '12 минут',
                description: 'Обследование сердечно-сосудистой и дыхательной систем',
                icon: 'stethoscope'
            },
            {
                id: 'history',
                name: 'Сбор жалоб и анамнеза',
                time: '8 минут',
                description: 'Стандартизированный сбор информации у пациента',
                icon: 'comment-medical'
            },
            {
                id: 'prevention',
                name: 'Профилактический осмотр',
                time: '10 минут',
                description: 'Профосмотр и рекомендации по профилактике',
                icon: 'shield-virus'
            }
        ];

        stationsGrid.innerHTML = stations.map(station => {
            const isCompleted = this.userStats.stations.scores[station.id] !== undefined;
            const practiceCount = this.userStats.stations.practiceCount[station.id] || 0;
            
            return `
                <div class="station-card" data-station="${station.id}">
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
                    <div class="station-actions">
                        <button class="button primary practice-station">Тренировать</button>
                        <button class="button secondary view-checklist">Чек-лист</button>
                        <button class="button secondary view-video" style="background: var(--accent); border-color: var(--accent);">
                            <i class="fas fa-video"></i> Видео
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStationById(stationId) {
        const stations = {
            'cpr': {
                id: 'cpr',
                name: 'СЛР',
                time: '10 минут',
                description: 'Сердечно-лёгочная реанимация взрослого и ребёнка',
                icon: 'heartbeat',
                checklist: [
                    'Оценка безопасности места происшествия',
                    'Проверка сознания пациента',
                    'Вызов скорой помощи',
                    'Открытие дыхательных путей',
                    'Проверка дыхания',
                    'Начало компрессий грудной клетки',
                    'Искусственное дыхание',
                    'Соотношение компрессий и вдохов 30:2',
                    'Использование AED при наличии',
                    'Продолжение до прибытия помощи'
                ]
            },
            'emergency': {
                id: 'emergency',
                name: 'Неотложная помощь',
                time: '15 минут',
                description: 'Оказание неотложной помощи при острых состояниях',
                icon: 'ambulance',
                checklist: [
                    'Быстрая оценка состояния пациента',
                    'Проверка ABC (дыхательные пути, дыхание, кровообращение)',
                    'Измерение жизненных показателей',
                    'Сбор краткого анамнеза',
                    'Выполнение неотложных вмешательств',
                    'Мониторинг состояния',
                    'Документирование действий'
                ]
            }
        };
        return stations[stationId];
    }

    startStationPractice(stationId) {
        const station = this.getStationById(stationId);
        if (!station) return;

        const practiceStationName = document.getElementById('practiceStationName');
        const stationPractice = document.getElementById('stationPractice');
        
        if (practiceStationName) practiceStationName.textContent = `${station.name} - Практическая отработка`;
        if (stationPractice) stationPractice.classList.remove('hidden');
        
        this.renderChecklist(stationId);
        this.resetStationTimer();
        
        const stationScore = document.getElementById('stationScore');
        if (stationScore) stationScore.textContent = '0/25';
        
        this.showToast(`Начата отработка станции: ${station.name}`, 'info');
    }

    renderChecklist(stationId) {
        const station = this.getStationById(stationId);
        if (!station) return;

        const checklistContainer = document.getElementById('stationChecklist');
        if (!checklistContainer) return;

        checklistContainer.innerHTML = '';

        station.checklist.forEach((item, index) => {
            const checklistItem = document.createElement('div');
            checklistItem.className = 'checklist-item';
            checklistItem.innerHTML = `
                <input type="checkbox" id="check-${index}">
                <label for="check-${index}">${item}</label>
            `;

            const checkbox = checklistItem.querySelector('input');
            checkbox.addEventListener('change', () => {
                this.updateStationScore();
            });

            checklistContainer.appendChild(checklistItem);
        });
    }

    updateStationScore() {
        const checkedItems = document.querySelectorAll('#stationChecklist input:checked').length;
        const totalItems = document.querySelectorAll('#stationChecklist input').length;
        const score = Math.round((checkedItems / totalItems) * 25);
        
        const stationScore = document.getElementById('stationScore');
        if (stationScore) stationScore.textContent = `${score}/25`;
    }

    startStationTimer() {
        let timeLeft = 600;
        const timerDisplay = document.getElementById('stationTimer');
        if (!timerDisplay) return;
        
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timer);
                this.showToast('Время вышло!', 'warning');
            }
        }, 1000);
    }

    resetStationTimer() {
        const timerDisplay = document.getElementById('stationTimer');
        if (timerDisplay) timerDisplay.textContent = '10:00';
    }

    closeStationPractice() {
        const stationPractice = document.getElementById('stationPractice');
        if (stationPractice) stationPractice.classList.add('hidden');
        this.showToast('Практика станции завершена', 'info');
    }

    submitStationPractice() {
        const stationScore = document.getElementById('stationScore');
        const practiceStationName = document.getElementById('practiceStationName');
        
        if (!stationScore || !practiceStationName) return;
        
        const score = parseInt(stationScore.textContent.split('/')[0]);
        const stationName = practiceStationName.textContent.split(' - ')[0];
        const stationId = this.getStationIdFromName(stationName);
        
        // Update stats
        if (!this.userStats.stations.practiceCount[stationId]) {
            this.userStats.stations.practiceCount[stationId] = 0;
        }
        this.userStats.stations.practiceCount[stationId]++;
        
        if (!this.userStats.stations.scores[stationId] || score > this.userStats.stations.scores[stationId]) {
            if (!this.userStats.stations.scores[stationId]) {
                this.userStats.stations.completed++;
            }
            this.userStats.stations.scores[stationId] = score;
        }
        
        // Award XP
        const xpEarned = score + (this.userStats.stations.practiceCount[stationId] * 5);
        this.awardXP(xpEarned);
        
        this.showToast(`Станция "${stationName}" завершена! Набрано баллов: ${score}/25. Получено ${xpEarned} XP`, 'success');
        this.closeStationPractice();
        this.renderStationsGrid();
        this.updateAllDisplays();
    }

    getStationIdFromName(stationName) {
        const stationsMap = {
            'СЛР': 'cpr',
            'Неотложная помощь': 'emergency'
        };
        return stationsMap[stationName] || 'cpr';
    }

    showTrainingVideo(stationId) {
        const station = this.getStationById(stationId);
        if (!station) return;

        // Создаем модальное окно
        const videoModal = document.createElement('div');
        videoModal.className = 'modal';
        videoModal.style.display = 'flex';
        videoModal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Обувающее видео: ${station.name}</h3>
                    <button class="modal-close" id="videoModalClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="video-container">
                        <div class="video-placeholder">
                            <i class="fas fa-video" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                            <p>Обучающее видео по станции "${station.name}"</p>
                            <p class="video-description">Здесь будет размещено обучающее видео с демонстрацией правильного выполнения всех этапов станции.</p>
                            <div class="video-info">
                                <div class="video-duration"><i class="fas fa-clock"></i> Длительность: 5-10 минут</div>
                                <div class="video-quality"><i class="fas fa-hd-video"></i> Качество: HD 1080p</div>
                            </div>
                            <button class="button primary" id="startVideo">
                                <i class="fas fa-play"></i> Начать просмотр
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(videoModal);

        // Добавляем обработчики закрытия
        const closeModal = () => {
            videoModal.remove();
        };

        // Закрытие по крестику
        const closeBtn = document.getElementById('videoModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Закрытие по клику вне окна
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeModal();
            }
        });

        // Кнопка воспроизведения
        const startVideoBtn = document.getElementById('startVideo');
        if (startVideoBtn) {
            startVideoBtn.addEventListener('click', () => {
                this.showToast('Воспроизведение видео начато', 'info');
            });
        }

        this.showToast(`Открыто видео для станции: ${station.name}`, 'info');
    }

    showChecklist(stationId) {
        const station = this.getStationById(stationId);
        if (!station) return;

        // Создаем модальное окно
        const checklistModal = document.createElement('div');
        checklistModal.className = 'modal';
        checklistModal.style.display = 'flex';
        checklistModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Чек-лист: ${station.name}</h3>
                    <button class="modal-close" id="checklistModalClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="checklist">
                        ${station.checklist.map((item, index) => `
                            <div class="checklist-item">
                                <input type="checkbox" id="modal-check-${index}">
                                <label for="modal-check-${index}">${item}</label>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="button primary" id="closeChecklistBtn">Закрыть</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(checklistModal);

        // Добавляем обработчики закрытия
        const closeModal = () => {
            checklistModal.remove();
        };

        // Закрытие по крестику
        const closeBtn = document.getElementById('checklistModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Закрытие по кнопке
        const closeChecklistBtn = document.getElementById('closeChecklistBtn');
        if (closeChecklistBtn) {
            closeChecklistBtn.addEventListener('click', closeModal);
        }

        // Закрытие по клику вне окна
        checklistModal.addEventListener('click', (e) => {
            if (e.target === checklistModal) {
                closeModal();
            }
        });

        this.showToast(`Открыт чек-лист для станции: ${station.name}`, 'info');
    }

    // ========== ЗАДАЧИ ==========

    initializeTasks() {
        console.log('Initializing tasks...');
        
        const startTaskBtn = document.getElementById('startRandomTask');
        const prevTaskStepBtn = document.getElementById('prevTaskStep');
        const nextTaskStepBtn = document.getElementById('nextTaskStep');
        const restartTaskBtn = document.getElementById('restartTask');

        if (startTaskBtn) {
            startTaskBtn.addEventListener('click', () => {
                this.startRandomTask();
            });
        }

        if (prevTaskStepBtn) {
            prevTaskStepBtn.addEventListener('click', () => {
                this.prevTaskStep();
            });
        }

        if (nextTaskStepBtn) {
            nextTaskStepBtn.addEventListener('click', () => {
                this.nextTaskStep();
            });
        }

        if (restartTaskBtn) {
            restartTaskBtn.addEventListener('click', () => {
                this.startRandomTask();
            });
        }
    }

    startRandomTask() {
        const tasks = this.generateSampleTasks();
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        
        this.taskState = {
            currentTask: randomTask,
            currentStep: 1,
            userAnswers: [],
            score: 0
        };

        const taskProgress = document.getElementById('taskProgress');
        const taskContent = document.getElementById('taskContent');
        const taskResults = document.getElementById('taskResults');

        if (taskProgress) taskProgress.classList.remove('hidden');
        if (taskContent) taskContent.classList.remove('hidden');
        if (taskResults) taskResults.classList.add('hidden');

        this.showCurrentTaskStep();
        this.showToast('Начата новая ситуационная задача', 'info');
    }

    generateSampleTasks() {
        return [
            {
                id: 1,
                title: 'Пациент с болью в груди',
                description: 'Пациент 55 лет обратился с жалобами на давящую боль за грудиной, иррадиирующую в левую руку, длительностью 30 минут. Сопутствующие симптомы: одышка, холодный пот.',
                steps: [
                    {
                        step: 1,
                        question: 'Какой первоначальный диагностический алгоритм следует применить?',
                        options: [
                            { text: 'Немедленное проведение ЭКГ', correct: true },
                            { text: 'Рентгенография грудной клетки', correct: false }
                        ]
                    }
                ]
            }
        ];
    }

    showCurrentTaskStep() {
        // Заглушка для демонстрации
        this.showToast('Функционал задач в разработке', 'info');
    }

    prevTaskStep() {
        this.showToast('Функционал задач в разработке', 'info');
    }

    nextTaskStep() {
        this.showToast('Функционал задач в разработке', 'info');
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

    initializeQuickActions() {
        console.log('Initializing quick actions...');
        
        document.addEventListener('click', (e) => {
            const actionCard = e.target.closest('.action-card');
            if (actionCard) {
                const action = actionCard.getAttribute('data-action');
                this.handleQuickAction(action);
            }
        });

        const startDailyChallengeBtn = document.getElementById('startDailyChallenge');
        if (startDailyChallengeBtn) {
            startDailyChallengeBtn.addEventListener('click', () => {
                this.startDailyChallenge();
            });
        }
    }

    initializeMobileFeatures() {
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', () => {
                this.toggleMobileNav();
            });
        }
    }

    initializeProfile() {
        const profileBtn = document.getElementById('profileBtn');
        const closeProfileModal = document.getElementById('closeProfileModal');

        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfileModal();
            });
        }

        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', () => {
                this.hideProfileModal();
            });
        }
    }

    initializeExamProgress() {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.addEventListener('click', () => {
                const stepNumber = parseInt(step.getAttribute('data-step'));
                this.showToast(`Переход к этапу ${stepNumber}`, 'info');
            });
        });
    }

    handleQuickAction(action) {
        const actions = {
            'random-theory': () => this.startRandomTest(),
            'cpr-training': () => this.startStationPractice('cpr'),
            'emergency': () => this.startStationPractice('emergency'),
            'checklists': () => this.showChecklist('cpr')
        };
        
        if (actions[action]) {
            actions[action]();
        } else {
            this.showToast('Функция в разработке', 'info');
        }
    }

    startDailyChallenge() {
        this.startRandomTest();
    }

    toggleMobileNav() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    showProfileModal() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.classList.remove('hidden');
            this.updateProfileModal();
        }
    }

    hideProfileModal() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.classList.add('hidden');
        }
    }

    updateProfileModal() {
        // Заглушка для обновления модального окна профиля
    }

    awardXP(xp) {
        this.currentXP += xp;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const xpForNextLevel = this.currentLevel * 1000;
        if (this.currentXP >= xpForNextLevel) {
            this.currentLevel++;
            this.showToast(`Поздравляем! Вы достигли уровня ${this.currentLevel}!`, 'success');
        }
    }

    updateDailyProgress() {
        const progress = Math.min((this.dailyProgress.questions / 10) * 100, 100);
        const dailyProgressElement = document.getElementById('dailyProgress');
        const dailyProgressText = document.getElementById('dailyProgressText');
        
        if (dailyProgressElement) dailyProgressElement.style.width = `${progress}%`;
        if (dailyProgressText) dailyProgressText.textContent = `${this.dailyProgress.questions}/10`;
        
        if (this.dailyProgress.questions >= 10 && !this.dailyProgress.completed) {
            this.dailyProgress.completed = true;
            this.dailyProgress.lastCompleted = new Date().toISOString().split('T')[0];
            this.awardXP(100);
            this.showToast('Ежедневное задание выполнено! +100 XP', 'success');
        }
    }

    updateAllDisplays() {
        this.updateStatsDisplay();
        this.updateDashboardDisplay();
        this.saveProgress();
    }

    updateStatsDisplay() {
        const xpValue = document.getElementById('xpValue');
        const levelValue = document.getElementById('levelValue');
        const statsTheories = document.getElementById('statsTheories');
        const statsStations = document.getElementById('statsStations');
        const statsTasks = document.getElementById('statsTasks');

        if (xpValue) xpValue.textContent = this.currentXP;
        if (levelValue) levelValue.textContent = this.currentLevel;
        if (statsTheories) statsTheories.textContent = `${this.userStats.theories.completed}/${this.userStats.theories.total}`;
        if (statsStations) statsStations.textContent = `${this.userStats.stations.completed}/${this.userStats.stations.total}`;
        if (statsTasks) statsTasks.textContent = `${this.userStats.tasks.completed}/${this.userStats.tasks.total}`;
    }

    updateDashboardDisplay() {
        const dashboardTheories = document.getElementById('dashboardTheories');
        const completedTheories = document.getElementById('completedTheories');
        const progressTheories = document.getElementById('progressTheories');
        const completedStations = document.getElementById('completedStations');
        const progressStations = document.getElementById('progressStations');
        const dashboardTasks = document.getElementById('dashboardTasks');
        const completedTasks = document.getElementById('completedTasks');
        const progressTasks = document.getElementById('progressTasks');
        const theoryCount = document.getElementById('theoryCount');
        const tasksCount = document.getElementById('tasksCount');

        if (dashboardTheories) dashboardTheories.textContent = `${this.userStats.theories.total} вопросов из банка ФМЗА и МедикТест`;
        if (completedTheories) completedTheories.textContent = this.userStats.theories.completed;
        if (progressTheories) progressTheories.textContent = `${Math.round((this.userStats.theories.completed / this.userStats.theories.total) * 100)}%`;
        if (completedStations) completedStations.textContent = this.userStats.stations.completed;
        if (progressStations) progressStations.textContent = `${Math.round((this.userStats.stations.completed / this.userStats.stations.total) * 100)}%`;
        if (dashboardTasks) dashboardTasks.textContent = `${this.userStats.tasks.total} клинических задач с решениями`;
        if (completedTasks) completedTasks.textContent = this.userStats.tasks.completed;
        if (progressTasks) progressTasks.textContent = `${Math.round((this.userStats.tasks.completed / this.userStats.tasks.total) * 100)}%`;
        if (theoryCount) theoryCount.textContent = this.userStats.theories.total;
        if (tasksCount) tasksCount.textContent = this.userStats.tasks.total;
    }

    updateProgressTab() {
        // Заглушка для обновления вкладки прогресса
    }

    checkDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        if (this.dailyProgress.lastCompleted !== today) {
            this.dailyProgress.questions = 0;
            this.dailyProgress.completed = false;
        }
        this.updateDailyProgress();
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    const app = new MedMateApp();
});
