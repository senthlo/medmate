// ===== ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
class MedMateApp {
    constructor() {
        this.state = {
            version: 'trial',
            course: null,
            userStats: {
                totalQuestions: 0,
                correctAnswers: 0,
                testsCompleted: 0,
                stationsCompleted: 0,
                tasksCompleted: 0,
                timeSpent: 0,
                currentStreak: 0,
                bestStreak: 0,
                mistakes: [],
                xp: 0,
                level: 1,
                perfectStations: 0,
                achievements: [],
                lastActive: new Date().toISOString(),
                activityDays: new Set()
            },
            progressHistory: [],
            currentQuiz: null,
            currentStation: null,
            currentTask: null,
            settings: {
                notifications: true,
                darkMode: false,
                sounds: true
            }
        };

        this.screens = {
            welcome: document.getElementById('welcomeScreen'),
            version: document.getElementById('versionScreen'),
            course: document.getElementById('courseScreen'),
            main: document.getElementById('mainApp')
        };

        this.initializeApp();
    }

    initializeApp() {
        this.loadUserProgress();
        this.initializeNavigation();
        this.initializeEventListeners();
        this.updateActivity();
        
        // Скрыть главное приложение при загрузке
        this.screens.main.classList.add('hidden');
    }

    initializeNavigation() {
        // Навигация между экранами
        document.getElementById('startFreeButton').addEventListener('click', () => {
            this.showScreen('version');
        });

        document.querySelectorAll('[data-version]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.state.version = e.target.getAttribute('data-version');
                this.showScreen('course');
            });
        });

        document.getElementById('backToWelcomeButton').addEventListener('click', () => {
            this.showScreen('welcome');
        });

        // Выбор курса
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.course-card').forEach(c => {
                    c.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                this.state.course = e.currentTarget.getAttribute('data-course');
                document.getElementById('startLearningButton').disabled = false;
            });
        });

        document.getElementById('startLearningButton').addEventListener('click', () => {
            this.startApplication();
        });

        document.getElementById('backToVersionButton').addEventListener('click', () => {
            this.showScreen('version');
        });

        // Навигация по вкладкам
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Настройки
        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.state.settings.notifications = e.target.checked;
            this.saveUserProgress();
        });

        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.state.settings.darkMode = e.target.checked;
            this.toggleDarkMode();
            this.saveUserProgress();
        });

        document.getElementById('soundsToggle').addEventListener('change', (e) => {
            this.state.settings.sounds = e.target.checked;
            this.saveUserProgress();
        });
    }

    initializeEventListeners() {
        // Выбор вариантов ответа в тестах
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-option')) {
                const options = e.target.parentElement.querySelectorAll('.quiz-option');
                options.forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });

        // Чеклисты для станций
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.checklist-item')) {
                const item = e.target.closest('.checklist-item');
                if (e.target.checked) {
                    item.classList.add('completed');
                } else {
                    item.classList.remove('completed');
                }
            }
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        this.screens[screenName].classList.remove('hidden');
    }

    switchTab(tabId) {
        // Обновить активную вкладку
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.nav-tab[data-tab="${tabId}"]`).classList.add('active');

        // Обновить активный контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        // Загрузить контент для вкладки
        this.loadTabContent(tabId);
    }

    loadTabContent(tabId) {
        switch(tabId) {
            case 'theory':
                this.loadTheorySections();
                break;
            case 'stations':
                this.loadStations();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'progress':
                this.loadProgress();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    startApplication() {
        if (!this.state.course) {
            alert('Пожалуйста, выберите курс!');
            return;
        }
        
        this.showScreen('main');
        this.updateDashboard();
        this.updateWelcomeMessage();
        this.loadTabContent('dashboard');
    }

    // ===== ТЕСТИРОВАНИЕ =====
    loadTheorySections() {
        const container = document.getElementById('theorySections');
        if (!container) return;

        const sections = [
            { id: 'therapy', name: 'Терапия', icon: 'fas fa-heartbeat', count: QuestionDatabase.therapy.length },
            { id: 'surgery', name: 'Хирургия', icon: 'fas fa-syringe', count: QuestionDatabase.surgery.length },
            { id: 'pediatrics', name: 'Педиатрия', icon: 'fas fa-baby', count: QuestionDatabase.pediatrics.length },
            { id: 'reanimation', name: 'Реанимация', icon: 'fas fa-heart', count: QuestionDatabase.reanimation.length },
            { id: 'neurology', name: 'Неврология', icon: 'fas fa-brain', count: QuestionDatabase.neurology.length },
            { id: 'pharmacology', name: 'Фармакология', icon: 'fas fa-pills', count: QuestionDatabase.pharmacology.length }
        ];

        container.innerHTML = sections.map(section => `
            <div class="card section-card" onclick="app.startQuiz('${section.id}')">
                <div class="section-icon">
                    <i class="${section.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div class="body-medium text-dark" style="font-weight: 600;">${section.name}</div>
                    <div class="body-small text-gray">${section.count} вопросов</div>
                </div>
                <i class="fas fa-chevron-right text-gray"></i>
            </div>
        `).join('');
    }

    startQuiz(category) {
        const questions = QuestionDatabase[category] || [];
        if (questions.length === 0) {
            alert('В этом разделе пока нет вопросов!');
            return;
        }

        // Для пробной версии ограничиваем количество вопросов
        let quizQuestions = questions;
        if (this.state.version === 'trial') {
            quizQuestions = questions.slice(0, 10); // 10 вопросов в пробной версии
        }

        this.state.currentQuiz = {
            category: category,
            currentQuestion: 0,
            score: 0,
            questions: quizQuestions,
            startTime: Date.now(),
            userAnswers: [],
            markedQuestions: new Set()
        };

        this.showQuizInterface();
        this.loadQuestion();
        this.startTimer(120); // 2 минуты на вопрос
    }

    showQuizInterface() {
        document.querySelectorAll('.section-card').forEach(card => {
            card.style.display = 'none';
        });
        document.getElementById('quizContainer').classList.remove('hidden');
        document.getElementById('quizResults').classList.add('hidden');
        document.getElementById('answerReview').classList.add('hidden');
    }

    loadQuestion() {
        const quiz = this.state.currentQuiz;
        const question = quiz.questions[quiz.currentQuestion];
        
        if (!question) {
            this.endQuiz();
            return;
        }

        document.getElementById('quizQuestion').textContent = question.question;
        document.getElementById('currentQuestion').textContent = quiz.currentQuestion + 1;
        document.getElementById('totalQuestions').textContent = quiz.questions.length;

        const optionsContainer = document.getElementById('quizOptions');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            optionElement.textContent = option;
            optionElement.setAttribute('data-index', index);
            optionsContainer.appendChild(optionElement);
        });

        // Сбросить выбранный вариант
        const selectedOption = document.querySelector('.quiz-option.selected');
        if (selectedOption) {
            selectedOption.classList.remove('selected');
        }
    }

    startTimer(seconds) {
        let timeLeft = seconds;
        const timerElement = document.getElementById('quizTimer');
        
        if (this.state.currentQuiz.timer) {
            clearInterval(this.state.currentQuiz.timer);
        }

        this.state.currentQuiz.timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(this.state.currentQuiz.timer);
                this.nextQuestion();
            }
            timeLeft--;
        }, 1000);
    }

    nextQuestion() {
        const selectedOption = document.querySelector('.quiz-option.selected');
        if (!selectedOption) {
            alert('Пожалуйста, выберите ответ');
            return;
        }

        const quiz = this.state.currentQuiz;
        const selectedIndex = parseInt(selectedOption.getAttribute('data-index'));
        const isCorrect = selectedIndex === quiz.questions[quiz.currentQuestion].correct;
        
        // Сохранить ответ пользователя
        quiz.userAnswers.push({
            questionIndex: quiz.currentQuestion,
            selectedAnswer: selectedIndex,
            isCorrect: isCorrect,
            timeSpent: 120 - (parseInt(document.getElementById('quizTimer').textContent.split(':')[0]) * 60 + 
                             parseInt(document.getElementById('quizTimer').textContent.split(':')[1]))
        });

        if (isCorrect) {
            quiz.score++;
            this.state.userStats.correctAnswers++;
            if (this.state.settings.sounds) {
                this.playSound('correct');
            }
        } else {
            // Добавить в ошибки
            this.state.userStats.mistakes.push({
                question: quiz.questions[quiz.currentQuestion],
                userAnswer: selectedIndex,
                timestamp: Date.now(),
                category: quiz.category
            });
            if (this.state.settings.sounds) {
                this.playSound('incorrect');
            }
        }

        this.state.userStats.totalQuestions++;
        this.state.userStats.xp += isCorrect ? 10 : 5;

        // Перейти к следующему вопросу
        quiz.currentQuestion++;
        
        if (quiz.currentQuestion < quiz.questions.length) {
            this.loadQuestion();
            this.startTimer(120);
        } else {
            this.endQuiz();
        }

        this.updateDashboard();
        this.saveUserProgress();
    }

    markForReview() {
        const quiz = this.state.currentQuiz;
        if (quiz) {
            quiz.markedQuestions.add(quiz.currentQuestion);
            alert('Вопрос отмечен для повторения!');
        }
    }

    endQuiz() {
        const quiz = this.state.currentQuiz;
        if (!quiz) return;

        if (quiz.timer) {
            clearInterval(quiz.timer);
        }

        this.state.userStats.testsCompleted++;
        this.state.userStats.timeSpent += Math.floor((Date.now() - quiz.startTime) / 1000);

        // Показать результаты
        this.showQuizResults();
        this.updateDashboard();
        this.saveUserProgress();
    }

    showQuizResults() {
        const quiz = this.state.currentQuiz;
        const percentage = Math.round((quiz.score / quiz.questions.length) * 100);
        const timeSpent = Math.floor((Date.now() - quiz.startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;

        document.getElementById('quizScore').textContent = `${quiz.score}/${quiz.questions.length}`;
        document.getElementById('quizPercentage').textContent = `${percentage}% правильных ответов`;
        document.getElementById('quizTimeSpent').textContent = `Время: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('correctAnswers').textContent = quiz.score;
        document.getElementById('wrongAnswers').textContent = quiz.questions.length - quiz.score;
        document.getElementById('earnedXP').textContent = `${quiz.score * 10 + (quiz.questions.length - quiz.score) * 5} XP`;

        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');
    }

    showAnswerReview() {
        const quiz = this.state.currentQuiz;
        const reviewContainer = document.getElementById('reviewQuestions');
        
        reviewContainer.innerHTML = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(answer => answer.questionIndex === index);
            const isCorrect = userAnswer ? userAnswer.isCorrect : false;
            
            return `
                <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="body-medium text-dark mb-2">${index + 1}. ${question.question}</div>
                    <div class="body-small text-gray mb-2">
                        Ваш ответ: ${userAnswer ? question.options[userAnswer.selectedAnswer] : 'Нет ответа'}
                    </div>
                    <div class="body-small text-success mb-2">
                        Правильный ответ: ${question.options[question.correct]}
                    </div>
                    ${question.explanation ? `
                        <div class="review-explanation">
                            <div class="body-small text-dark">Объяснение:</div>
                            <div class="body-small text-gray">${question.explanation}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        document.getElementById('quizResults').classList.add('hidden');
        document.getElementById('answerReview').classList.remove('hidden');
    }

    closeReview() {
        document.getElementById('answerReview').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');
    }

    restartQuiz() {
        this.startQuiz(this.state.currentQuiz.category);
    }

    // ===== ПРАКТИЧЕСКИЕ СТАНЦИИ =====
    loadStations() {
        const container = document.getElementById('stationsGrid');
        if (!container || !this.state.course) return;

        const stations = StationsDatabase[this.state.course] || [];
        container.innerHTML = stations.map(station => `
            <div class="card section-card" onclick="app.startStation(${station.id})">
                <div class="section-icon">
                    <i class="fas fa-procedures"></i>
                </div>
                <div style="flex: 1;">
                    <div class="body-medium text-dark" style="font-weight: 600;">${station.title}</div>
                    <div class="body-small text-gray">${Math.floor(station.timeLimit / 60)} мин • ${station.checklist.length} шагов</div>
                </div>
                <i class="fas fa-chevron-right text-gray"></i>
            </div>
        `).join('');
    }

    startStation(stationId) {
        const stations = StationsDatabase[this.state.course] || [];
        const station = stations.find(s => s.id === stationId);
        if (!station) return;

        this.state.currentStation = {
            ...station,
            startTime: Date.now(),
            completedSteps: new Set(),
            timer: null
        };

        this.showStationInterface();
        this.loadStationContent();
        this.startStationTimer(station.timeLimit);
    }

    showStationInterface() {
        document.getElementById('stationsGrid').style.display = 'none';
        document.getElementById('stationPractice').classList.remove('hidden');
    }

    loadStationContent() {
        const station = this.state.currentStation;
        if (!station) return;

        document.getElementById('stationTitle').textContent = station.title;
        document.getElementById('stationDescription').textContent = station.description;

        const checklistContainer = document.getElementById('stationChecklist');
        checklistContainer.innerHTML = station.checklist.map((step, index) => `
            <div class="checklist-item">
                <input type="checkbox" id="step-${index}" onchange="app.toggleStationStep(${index})">
                <label for="step-${index}" class="body-small text-dark">${step}</label>
            </div>
        `).join('');
    }

    toggleStationStep(stepIndex) {
        const station = this.state.currentStation;
        if (!station) return;

        const checkbox = document.getElementById(`step-${stepIndex}`);
        if (checkbox.checked) {
            station.completedSteps.add(stepIndex);
        } else {
            station.completedSteps.delete(stepIndex);
        }
    }

    startStationTimer(seconds) {
        let timeLeft = seconds;
        const timerElement = document.getElementById('stationTimer');
        
        if (this.state.currentStation.timer) {
            clearInterval(this.state.currentStation.timer);
        }

        this.state.currentStation.timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(this.state.currentStation.timer);
                this.completeStation();
            }
            timeLeft--;
        }, 1000);
    }

    resetStation() {
        const station = this.state.currentStation;
        if (station && station.timer) {
            clearInterval(station.timer);
        }
        this.startStation(station.id);
    }

    completeStation() {
        const station = this.state.currentStation;
        if (!station) return;

        if (station.timer) {
            clearInterval(station.timer);
        }

        const allStepsCompleted = station.completedSteps.size === station.checklist.length;
        const timeSpent = Math.floor((Date.now() - station.startTime) / 1000);

        this.state.userStats.stationsCompleted++;
        this.state.userStats.timeSpent += timeSpent;
        
        if (allStepsCompleted) {
            this.state.userStats.xp += 50;
            this.state.userStats.perfectStations++;
            alert('Станция успешно завершена! +50 XP');
        } else {
            this.state.userStats.xp += 20;
            alert('Станция завершена с ошибками. +20 XP');
        }

        this.hideStationInterface();
        this.updateDashboard();
        this.saveUserProgress();
        this.checkAchievements();
    }

    hideStationInterface() {
        document.getElementById('stationPractice').classList.add('hidden');
        document.getElementById('stationsGrid').style.display = 'grid';
        this.state.currentStation = null;
    }

    // ===== СИТУАЦИОННЫЕ ЗАДАЧИ =====
    loadTasks() {
        const container = document.getElementById('tasksGrid');
        if (!container || !this.state.course) return;

        const tasks = TasksDatabase[this.state.course] || [];
        container.innerHTML = tasks.map(task => `
            <div class="card section-card" onclick="app.startTask(${task.id})">
                <div class="section-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <div style="flex: 1;">
                    <div class="body-medium text-dark" style="font-weight: 600;">${task.title}</div>
                    <div class="body-small text-gray">${task.questions.length} вопросов</div>
                </div>
                <i class="fas fa-chevron-right text-gray"></i>
            </div>
        `).join('');
    }

    startTask(taskId) {
        const tasks = TasksDatabase[this.state.course] || [];
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        this.state.currentTask = {
            ...task,
            startTime: Date.now(),
            userAnswers: []
        };

        this.showTaskInterface();
        this.loadTaskContent();
    }

    showTaskInterface() {
        document.getElementById('tasksGrid').style.display = 'none';
        document.getElementById('taskPractice').classList.remove('hidden');
    }

    loadTaskContent() {
        const task = this.state.currentTask;
        if (!task) return;

        document.getElementById('taskTitle').textContent = task.title;
        document.getElementById('taskScenario').textContent = task.scenario;

        const questionsContainer = document.getElementById('taskQuestions');
        questionsContainer.innerHTML = task.questions.map((q, index) => `
            <div class="task-question">
                <div class="body-medium text-dark mb-2">${index + 1}. ${q.question}</div>
                ${q.type === 'text' ? `
                    <textarea class="task-answer" id="answer-${index}" placeholder="Введите ваш ответ..."></textarea>
                ` : `
                    <div class="quiz-options">
                        ${q.options.map((option, optIndex) => `
                            <div class="quiz-option" data-index="${optIndex}">${option}</div>
                        `).join('')}
                    </div>
                `}
            </div>
        `).join('');
    }

    checkTaskAnswers() {
        const task = this.state.currentTask;
        if (!task) return;

        let correctAnswers = 0;
        task.userAnswers = [];

        task.questions.forEach((question, index) => {
            let userAnswer;
            let isCorrect = false;

            if (question.type === 'text') {
                const textarea = document.getElementById(`answer-${index}`);
                userAnswer = textarea.value.trim();
                // Простая проверка текстовых ответов
                isCorrect = userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase());
            } else {
                const selectedOption = document.querySelector(`#taskQuestions .quiz-option.selected[data-index]`);
                if (selectedOption) {
                    userAnswer = parseInt(selectedOption.getAttribute('data-index'));
                    isCorrect = userAnswer === question.correct;
                }
            }

            task.userAnswers.push({
                questionIndex: index,
                userAnswer: userAnswer,
                isCorrect: isCorrect
            });

            if (isCorrect) correctAnswers++;
        });

        const percentage = Math.round((correctAnswers / task.questions.length) * 100);
        const timeSpent = Math.floor((Date.now() - task.startTime) / 1000);

        this.state.userStats.tasksCompleted++;
        this.state.userStats.timeSpent += timeSpent;
        this.state.userStats.xp += percentage >= 70 ? 40 : 20;

        alert(`Задача завершена! Правильных ответов: ${correctAnswers}/${task.questions.length} (${percentage}%)`);

        this.hideTaskInterface();
        this.updateDashboard();
        this.saveUserProgress();
        this.checkAchievements();
    }

    resetTask() {
        const task = this.state.currentTask;
        if (task) {
            this.startTask(task.id);
        }
    }

    hideTaskInterface() {
        document.getElementById('taskPractice').classList.add('hidden');
        document.getElementById('tasksGrid').style.display = 'grid';
        this.state.currentTask = null;
    }

    // ===== ПРОГРЕСС И СТАТИСТИКА =====
    updateDashboard() {
        // Обновить статистику на главной
        document.getElementById('statsQuestions').textContent = this.state.userStats.totalQuestions;
        document.getElementById('statsAccuracy').textContent = this.state.userStats.totalQuestions > 0 ? 
            Math.round((this.state.userStats.correctAnswers / this.state.userStats.totalQuestions) * 100) + '%' : '0%';
        document.getElementById('statsTime').textContent = Math.round(this.state.userStats.timeSpent / 3600) + 'ч';
        document.getElementById('statsLevel').textContent = this.state.userStats.level;
        
        // Обновить заголовок
        document.getElementById('headerXP').textContent = this.state.userStats.xp;
        document.getElementById('headerLevel').textContent = this.state.userStats.level;
        
        // Обновить счетчик ошибок
        const mistakesCount = this.state.userStats.mistakes.length;
        document.getElementById('mistakesCount').textContent = 
            mistakesCount + ' вопрос' + this.getRussianPlural(mistakesCount, '', 'а', 'ов') + ' для повторения';

        // Обновить уровень
        this.updateLevel();
    }

    updateLevel() {
        const xp = this.state.userStats.xp;
        const newLevel = Math.floor(xp / 100) + 1;
        
        if (newLevel > this.state.userStats.level) {
            this.state.userStats.level = newLevel;
            if (this.state.settings.sounds) {
                this.playSound('levelup');
            }
            alert(`Поздравляем! Вы достигли ${newLevel} уровня!`);
        }
    }

    loadProgress() {
        // Общий прогресс
        const totalActivities = this.state.userStats.testsCompleted + this.state.userStats.stationsCompleted + this.state.userStats.tasksCompleted;
        const overallProgress = totalActivities > 0 ? Math.min(100, Math.round((totalActivities / 50) * 100)) : 0;
        
        document.getElementById('overallProgress').textContent = overallProgress + '%';
        document.getElementById('overallProgressBar').style.width = overallProgress + '%';

        // Слабые зоны
        this.loadWeakTopics();

        // Достижения
        this.loadAchievements();
    }

    loadWeakTopics() {
        const container = document.getElementById('weakTopics');
        if (!container) return;

        // Анализ ошибок по категориям
        const categoryErrors = {};
        this.state.userStats.mistakes.forEach(mistake => {
            if (mistake.category) {
                categoryErrors[mistake.category] = (categoryErrors[mistake.category] || 0) + 1;
            }
        });

        const weakTopics = Object.entries(categoryErrors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        container.innerHTML = weakTopics.map(([category, errors]) => {
            const categoryNames = {
                therapy: 'Терапия',
                surgery: 'Хирургия',
                pediatrics: 'Педиатрия',
                reanimation: 'Реанимация',
                neurology: 'Неврология',
                pharmacology: 'Фармакология'
            };

            return `
                <div class="topic-item">
                    <div class="body-medium text-dark">${categoryNames[category] || category}</div>
                    <div class="badge badge-error">${errors} ошибок</div>
                </div>
            `;
        }).join('') || '<div class="body-small text-gray">Пока нет данных о слабых зонах</div>';
    }

    loadAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;

        const achievements = AchievementsDatabase.map(achievement => {
            const earned = this.state.userStats.achievements.includes(achievement.id);
            const conditionMet = achievement.condition(this.state.userStats);

            return {
                ...achievement,
                earned: earned,
                conditionMet: conditionMet
            };
        });

        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.earned ? 'earned' : ''}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div class="body-medium text-dark">${achievement.name}</div>
                    <div class="body-small text-gray">${achievement.description}</div>
                </div>
                <div class="body-small ${achievement.earned ? 'text-success' : 'text-gray'}">
                    ${achievement.earned ? `+${achievement.xp} XP` : (achievement.conditionMet ? 'Готово к получению' : '')}
                </div>
            </div>
        `).join('');
    }

    checkAchievements() {
        AchievementsDatabase.forEach(achievement => {
            if (!this.state.userStats.achievements.includes(achievement.id) && 
                achievement.condition(this.state.userStats)) {
                
                this.state.userStats.achievements.push(achievement.id);
                this.state.userStats.xp += achievement.xp;
                
                if (this.state.settings.sounds) {
                    this.playSound('achievement');
                }
                
                alert(`Достижение получено: ${achievement.name}! +${achievement.xp} XP`);
            }
        });
    }

    // ===== ПРОФИЛЬ =====
    loadProfile() {
        document.getElementById('profileName').textContent = 'Студент';
        document.getElementById('profileCourse').textContent = this.state.course === 'nurse' ? 
            'Медсестра/Медбрат' : 'Врач';
        document.getElementById('profileLevel').textContent = this.state.userStats.level;
        document.getElementById('profileXP').textContent = this.state.userStats.xp + ' XP';
        document.getElementById('profileVersion').textContent = this.state.version === 'premium' ? 'Премиум' : 'Пробная';
        document.getElementById('profileActivity').textContent = this.state.userStats.activityDays.size + ' дней';

        // Настройки
        document.getElementById('notificationsToggle').checked = this.state.settings.notifications;
        document.getElementById('darkModeToggle').checked = this.state.settings.darkMode;
        document.getElementById('soundsToggle').checked = this.state.settings.sounds;
    }

    // ===== УТИЛИТЫ =====
    updateWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting;
        
        if (hour >= 5 && hour < 12) greeting = 'Доброе утро';
        else if (hour >= 12 && hour < 18) greeting = 'Добрый день';
        else if (hour >= 18 && hour < 23) greeting = 'Добрый вечер';
        else greeting = 'Доброй ночи';

        document.getElementById('welcomeMessage').textContent = greeting + '!';
    }

    updateActivity() {
        const today = new Date().toISOString().split('T')[0];
        this.state.userStats.activityDays.add(today);
        this.state.userStats.lastActive = new Date().toISOString();
        this.saveUserProgress();
    }

    getRussianPlural(number, one, two, five) {
        number = Math.abs(number);
        number %= 100;
        if (number >= 5 && number <= 20) {
            return five;
        }
        number %= 10;
        if (number === 1) {
            return one;
        }
        if (number >= 2 && number <= 4) {
            return two;
        }
        return five;
    }

    playSound(type) {
        // Простая имитация звуков через Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch(type) {
                case 'correct':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    break;
                case 'incorrect':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
                case 'levelup':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    break;
                case 'achievement':
                    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                    break;
            }

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Web Audio API не поддерживается');
        }
    }

    toggleDarkMode() {
        if (this.state.settings.darkMode) {
            document.documentElement.style.setProperty('--gray-50', '#111827');
            document.documentElement.style.setProperty('--gray-100', '#1F2937');
            document.documentElement.style.setProperty('--gray-200', '#374151');
            document.documentElement.style.setProperty('--gray-900', '#F9FAFB');
        } else {
            document.documentElement.style.setProperty('--gray-50', '#F9FAFB');
            document.documentElement.style.setProperty('--gray-100', '#F3F4F6');
            document.documentElement.style.setProperty('--gray-200', '#E5E7EB');
            document.documentElement.style.setProperty('--gray-900', '#111827');
        }
    }

    // ===== СОХРАНЕНИЕ И ЗАГРУЗКА =====
    saveUserProgress() {
        const data = {
            state: this.state,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('medmate_progress', JSON.stringify(data));
    }

    loadUserProgress() {
        try {
            const saved = localStorage.getItem('medmate_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data.state };
                
                // Восстановить Set'ы
                this.state.userStats.activityDays = new Set(this.state.userStats.activityDays);
            }
        } catch (e) {
            console.log('Ошибка загрузки прогресса:', e);
        }
    }

    exportProgress() {
        const data = {
            state: this.state,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medmate_progress_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
            localStorage.removeItem('medmate_progress');
            location.reload();
        }
    }

    // ===== ОБЩИЕ МЕТОДЫ =====
    startActivity(type) {
        switch(type) {
            case 'theory':
                this.switchTab('theory');
                break;
            case 'stations':
                this.switchTab('stations');
                break;
            case 'tasks':
                this.switchTab('tasks');
                break;
            case 'mistakes':
                this.startMistakesReview();
                break;
        }
    }

    startMistakesReview() {
        const mistakes = this.state.userStats.mistakes;
        if (mistakes.length === 0) {
            alert('Пока нет вопросов для повторения!');
            return;
        }

        const reviewQuestions = mistakes.map(m => m.question).slice(0, 10);
        this.state.currentQuiz = {
            category: 'mistakes',
            currentQuestion: 0,
            score: 0,
            questions: reviewQuestions,
            startTime: Date.now(),
            userAnswers: [],
            markedQuestions: new Set()
        };

        this.switchTab('theory');
        this.showQuizInterface();
        this.loadQuestion();
        this.startTimer(120);
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MedMateApp();
});

// Глобальные функции для HTML
function startActivity(type) {
    if (app) app.startActivity(type);
}

function startQuiz(category) {
    if (app) app.startQuiz(category);
}

function nextQuestion() {
    if (app) app.nextQuestion();
}

function markForReview() {
    if (app) app.markForReview();
}

function showAnswerReview() {
    if (app) app.showAnswerReview();
}

function closeReview() {
    if (app) app.closeReview();
}

function restartQuiz() {
    if (app) app.restartQuiz();
}

function resetStation() {
    if (app) app.resetStation();
}

function completeStation() {
    if (app) app.completeStation();
}

function resetTask() {
    if (app) app.resetTask();
}

function checkTaskAnswers() {
    if (app) app.checkTaskAnswers();
}

function exportProgress() {
    if (app) app.exportProgress();
}

function resetProgress() {
    if (app) app.resetProgress();
}
