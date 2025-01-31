export default {
    template: `
    <div class="container my-4">
        <div v-if="quiz">
            <h1 class="text-center mb-4">Quiz: {{ quiz.remarks || 'Quiz' }}</h1>
            <div v-if="currentQuestion">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</h5>
                        <p class="card-text">{{ currentQuestion.question_statement }}</p>
                        <div class="form-check" v-for="(option, index) in options" :key="index">
                            <input 
                                class="form-check-input" 
                                type="radio" 
                                :name="'question' + currentQuestion.id" 
                                :value="index + 1" 
                                v-model="selectedOption"
                            >
                            <label class="form-check-label">{{ option }}</label>
                        </div>
                    </div>
                </div>
                <div class="mt-3 d-flex justify-content-between">
                    <button class="btn btn-secondary" @click="prevQuestion" :disabled="currentQuestionIndex === 0">Previous</button>
                    <button class="btn btn-primary" @click="nextQuestion" :disabled="!selectedOption">
                        {{ currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next' }}
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="text-center">
            <p class="text-muted">Loading quiz...</p>
        </div>
    </div>
    `,
    data() {
        return {
            quiz: null, // Store quiz details
            currentQuestionIndex: 0, // Track current question
            selectedOption: null, // Track selected answer
            answers: [] // Store user's answers
        };
    },
    computed: {
        currentQuestion() {
            return this.quiz?.questions[this.currentQuestionIndex] || null;
        },
        options() {
            if (!this.currentQuestion) return [];
            return [
                this.currentQuestion.option1,
                this.currentQuestion.option2,
                this.currentQuestion.option3,
                this.currentQuestion.option4
            ];
        }
    },
    async mounted() {
        const quizId = this.$route.params.quizId; // Get quiz ID from route
        const response = await fetch(`${location.origin}/api/quizzes/${quizId}`, {
            headers: {
                'Authorization-Token': this.$store.state.auth_token
            },
        });

        const quiz = await response.json();
        this.quiz = quiz;
    },
    methods: {
        nextQuestion() {
            // Save the selected answer
            this.answers.push({
                questionId: this.currentQuestion.id,
                selectedOption: this.selectedOption
            });

            // Move to the next question or submit the quiz
            if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
                this.currentQuestionIndex++;
                this.selectedOption = null; // Reset selected option
            } else {
                this.submitQuiz();
            }
        },
        prevQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.selectedOption = this.answers[this.currentQuestionIndex]?.selectedOption || null;
            }
        },
        async submitQuiz() {
            // Calculate the score
            let score = 0;
            this.quiz.questions.forEach((question, index) => {
                if (this.answers[index]?.selectedOption === question.correct_option) {
                    score++;
                }
            });

            // Submit the score to the backend
            const response = await fetch(`${location.origin}/api/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization-Token': this.$store.state.auth_token
                },
                body: JSON.stringify({
                    quiz_id: this.quiz.id,
                    total_score: score
                })
            });

            if (response.ok) {
                alert(`Quiz submitted! Your score is ${score}/${this.quiz.questions.length}`);
                this.$router.push('/'); // Redirect to home or results page
            } else {
                alert('Failed to submit quiz. Please try again.');
            }
        }
    }
};