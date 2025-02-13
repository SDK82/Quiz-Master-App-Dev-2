export default {
    props: ["quizId"],
    template: `
    <div class="container my-4">
        <!-- Timer -->
        <div class="text-end mb-3">
            <h4>Time Remaining: {{ formattedTime }}</h4>
        </div>

        <!-- Main Exam Layout -->
        <div class="row">
            <!-- Question Navigation Panel -->
            <div class="col-md-3">
                <div class="card shadow-sm p-3">
                    <h5 class="text-center">Questions</h5>
                    <div class="d-flex flex-wrap">
                    <button
                    v-for="(question, index) in questions"
                    :key="index"
                    type="button"
                    class="btn m-1"
                    :class="{
                        'btn-primary': currentQuestionIndex === index,
                        'btn-outline-primary': !quizCompleted && selectedOptions[index] === undefined && currentQuestionIndex !== index && !visitedQuestions[index],
                        'btn-info': selectedOptions[index] !== undefined && !quizCompleted,
                        'btn-success': quizCompleted && isCorrect(index),
                        'btn-danger': (quizCompleted && !isCorrect(index)) || (!quizCompleted && visitedQuestions[index] && selectedOptions[index] === undefined),
                    }"
                    
                    @click="goToQuestion(index)"
                >
                    {{ index + 1 }}
                </button>
                    </div>
                </div>
            </div>

            <!-- Question Display Area -->
            <div class="col-md-9">
                <div v-if="questions.length === 0" class="text-center">
                    <p class="text-muted">No questions available for this quiz.</p>
                    <button class="btn btn-primary" @click="goBack">Go Back</button>
                </div>
                <div v-else>
                    <div v-if="currentQuestionIndex < questions.length">
                        <div class="card shadow-sm p-4">
                            <h4 class="mb-3">{{ currentQuestion.question_statement }}</h4>
                            <div class="form-check" v-for="(option, index) in options" :key="index">
                                <input
                                    type="radio"
                                    class="form-check-input"
                                    :id="'option' + index"
                                    :value="index + 1"
                                    v-model="selectedOptions[currentQuestionIndex]"
                                    :disabled="quizCompleted" 
                                />
                                <label class="form-check-label" :for="'option' + index">
                                    {{ option }}
                                    <span v-if="quizCompleted && (index + 1) === currentQuestion.correct_option" class="text-success">
                                        ✅ Correct Answer
                                    </span>
                                    <span v-if="quizCompleted && (index + 1) === selectedOptions[currentQuestionIndex] && (index + 1) !== currentQuestion.correct_option" class="text-danger">
                                        ❌ Incorrect
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- Navigation Buttons -->
                        <div class="d-flex justify-content-between mt-3">
                            <button
                                class="btn btn-secondary"
                                @click="previousQuestion"
                                :disabled="currentQuestionIndex === 0"
                            >
                                Previous
                            </button>

                            <button 
                                class="btn btn-warning" 
                                @click="skipQuestion"
                                :disabled="quizCompleted"
                            >
                                Skip
                            </button>

                            <!-- Next Button (Shows for all except last question) -->
                            <button
                                class="btn btn-primary"
                                @click="nextQuestion"
                                v-if="currentQuestionIndex < questions.length - 1"
                            >
                                Next
                            </button>

                            <!-- Submit Button (Shows only on the last question) -->
                            <button 
                                class="btn btn-success" 
                                @click="submitQuiz" 
                                v-if="currentQuestionIndex === questions.length - 1"
                                :disabled="quizCompleted"
                            >
                                Submit Quiz
                            </button>
                        </div>

                    <!-- Quiz Completion Message -->
                    <div v-if="quizCompleted" class="text-center mt-4">
                        <h2>Quiz Completed!</h2>
                        <p>Your score: {{ score }} / {{ questions.length }}</p>
                        <button class="btn btn-success" @click="goBack">Return to Quizzes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    `,

    data() {
        return {
            questions: [],
            currentQuestionIndex: 0,
            selectedOptions: [], // Stores selected answers
            score: 0,
            timeRemaining: 0,
            timerInterval: null,
            quizCompleted: false, 
            quiz: {},
            answeredQuestions: [],
            visitedQuestions: [],
        };
    },

    async mounted() {
        const res = await fetch(`${location.origin}/api/quizzes/${this.quizId}`, {
            headers: { 'Authorization-Token': this.$store.state.auth_token },
        });
        const quiz = await res.json();
        this.quiz = quiz;

        // Convert time_duration ("MM:SS") to seconds
        if (quiz.time_duration) {
            const [minutes, seconds] = quiz.time_duration.split(":").map(Number);
            this.timeRemaining = (minutes * 60) + seconds;
        } else {
            this.timeRemaining = 1800;
        }

        // Fetch quiz questions
        const response = await fetch(`${location.origin}/api/quizzes/${this.quizId}/questions`, {
            headers: { 'Authorization-Token': this.$store.state.auth_token },
        });
        const questions = await response.json();
        this.questions = questions;
        this.selectedOptions = new Array(questions.length).fill(undefined);

        // Start the timer
        this.startTimer();
    },

    computed: {
        currentQuestion() {
            return this.questions[this.currentQuestionIndex] || {};
        },
        options() {
            return [
                this.currentQuestion.option1,
                this.currentQuestion.option2,
                this.currentQuestion.option3,
                this.currentQuestion.option4,
            ];
        },
        formattedTime() {
            if (isNaN(this.timeRemaining) || this.timeRemaining < 0) {
                return "00:00";
            }
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        },
    },

    methods: {
        startTimer() {
            this.timerInterval = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    clearInterval(this.timerInterval);
                    this.submitQuiz();
                }
            }, 1000);
        },

        stopTimer() {
            clearInterval(this.timerInterval);
        },

        nextQuestion() {
            if (this.selectedOptions[this.currentQuestionIndex] === this.currentQuestion.correct_option) {
                this.score++;
                this.answeredQuestions[this.currentQuestionIndex] = true;
                this.visitedQuestions[this.currentQuestionIndex] = true;
            }
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.visitedQuestions[this.currentQuestionIndex] = true;
                this.currentQuestionIndex++;
                
            } else {
                this.submitQuiz();
            }
            if(quizCompleted){
                if(this.currentQuestionIndex < this.questions.length - 1) {
                    this.currentQuestionIndex++;

            }
        }
        },

        previousQuestion() {
            if (this.currentQuestionIndex > 0) {

                this.currentQuestionIndex--;
            }
        },

        skipQuestion() {

        
            // ✅ Ensure current index exists before setting undefined
            this.selectedOptions[this.currentQuestionIndex] = undefined;

            this.selectedOption = null;
            this.answeredQuestions[this.currentQuestionIndex] = false;
            this.visitedQuestions[this.currentQuestionIndex] = true;
        
            // ✅ Move to the next question safely
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex = 0;
            }
            if (!this.selectedOptions) {
                this.selectedOptions = [];
            }
        }
        ,
        
        goToQuestion(index) {
            this.currentQuestionIndex = index;
            this.visitedQuestions[index] = true;
        },

        async submitQuiz() {
            this.visitedQuestions[this.currentQuestionIndex] = true;
            if (this.quizCompleted) return;
            this.quizCompleted = true;
            this.stopTimer();

            // Calculate score
            this.score = this.questions.reduce((acc, question, index) => {
                return acc + (this.selectedOptions[index] === question.correct_option ? 1 : 0);
            }, 0);

            try {
                await fetch(`${location.origin}/api/scores`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization-Token": this.$store.state.auth_token,
                    },
                    body: JSON.stringify({
                        quiz_id: this.quizId,
                        user_id: this.$store.state.user_id,
                        total_score: this.score,
                    }),
                });
            } catch (error) {
                console.error("Error saving score:", error);
            }
        },

        isCorrect(index) {
            return this.selectedOptions[index] === this.questions[index].correct_option;
        },

        goBack() {
            this.$router.go(-1);
        },
    },

    beforeUnmount() {
        this.stopTimer();
    },
};
