export default {
    props: ["quizId"], // Receive quiz ID from route
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
                            class="btn m-1"
                            :class="{
                                'btn-primary': currentQuestionIndex === index,
                                'btn-outline-primary': currentQuestionIndex !== index,
                                'btn-success': answeredQuestions[index]
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
                                    v-model="selectedOption"
                                />
                                <label class="form-check-label" :for="'option' + index">
                                    {{ option }}
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
                                class="btn btn-primary"
                                @click="nextQuestion"
                                :disabled="selectedOption === null"
                            >
                                {{ currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next' }}
                            </button>
                        </div>
                    </div>

<!-- Quiz Completion Message -->
<div v-if="quizCompleted" class="text-center">
    <h2>Quiz Completed!</h2>
    <p>Your score: {{ score }} / {{ questions.length }}</p>
    <button class="btn btn-success" @click="goBack">Return to Quizzes</button>
</div>

                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            questions: [], // Store quiz questions
            currentQuestionIndex: 0,
            selectedOption: null,
            score: 0,
            answeredQuestions: [], // Track answered questions
            timeRemaining: 1800, // 30 minutes in seconds
            timerInterval: null,
            quizCompleted: false, // Track if quiz is completed
        };
    },
    async mounted() {
        // Fetch quiz questions
        const response = await fetch(`${location.origin}/api/quizzes/${this.quizId}/questions`, {
            headers: {
                'Authorization-Token': this.$store.state.auth_token,
            },
        });
        const questions = await response.json();
        this.questions = questions;
        this.answeredQuestions = new Array(questions.length).fill(false);

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
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        },
    },
    methods: {
        // Timer Methods
        startTimer() {
            this.timerInterval = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    clearInterval(this.timerInterval);
                    this.submitQuiz(); // Automatically submit when time is up
                }
            }, 1000);
        },
        stopTimer() {
            clearInterval(this.timerInterval);
        },

        // Question Navigation
        nextQuestion() {
            if (this.selectedOption === this.currentQuestion.correct_option) {
                this.score++;
            }
            this.answeredQuestions[this.currentQuestionIndex] = true;
            this.selectedOption = null;

            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
            } else {
                this.submitQuiz();
            }
        },
        previousQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
            }
        },
        goToQuestion(index) {
            this.currentQuestionIndex = index;
        },

        // Quiz Submission
        async submitQuiz() {
            if (this.quizCompleted) return; // Prevent multiple submissions
        
            this.quizCompleted = true;
            this.stopTimer(); // Stop the timer
        
            try {
                // Send the score to the server
                const response = await fetch(`${location.origin}/api/scores`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization-Token": this.$store.state.auth_token,  // Ensure the token is correct
                    },
                    body: JSON.stringify({
                        quiz_id: this.quizId,
                        user_id: this.$store.state.user_id,
                        total_score: this.score,
                    }),
                });
        
                if (!response.ok) {
                    throw new Error("Failed to save score.");
                }
        
                // If the response is successful, you can also log this for debugging
                console.log("Score saved successfully!");
        
                // Update the quiz completion UI
                this.$nextTick(() => {
                    // This ensures that Vue knows when to re-render the UI.
                    this.quizCompleted = true;
                });
            } catch (error) {
                console.error("Error saving score:", error);
            }
        },
        
                goBack() {
            this.$router.go(-1);
        },
    },
    beforeUnmount() {
        this.stopTimer(); // Clean up the timer when the component is destroyed
    },
};
