export default {
    props: ["quizId"], // Receive quiz ID from route
    template: `
    <div class="container my-4">
        <div v-if="questions.length === 0" class="text-center">
            <p class="text-muted">No questions available for this quiz.</p>
            <button class="btn btn-primary" @click="goBack">Go Back</button>
        </div>
        <div v-else>
            <h1 class="mb-4 text-center">Quiz ID: {{ quizId }}</h1>
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
                    <button class="btn btn-primary mt-3 w-100" @click="nextQuestion" :disabled="selectedOption === null">
                        {{ currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question' }}
                    </button>
                </div>
            </div>
            <div v-else class="text-center">
                <h2>Quiz Completed!</h2>
                <p>Your score: {{ score }} / {{ questions.length }}</p>
                <button class="btn btn-success" @click="goBack">Return to Quizzes</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            questions: [], // Store quiz questions
            currentQuestionIndex: 0,
            selectedOption: null,
            score: 0
        };
    },
    async mounted() {
        const response = await fetch(`${location.origin}/api/quizzes/${this.quizId}/questions`, {
            headers: {
                'Authorization-Token': this.$store.state.auth_token
            },
        });

        const questions = await response.json();
        this.questions = questions;
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
                this.currentQuestion.option4
            ];
        }
    },
    methods: {
        nextQuestion() {
            if (this.selectedOption === this.currentQuestion.correct_option) {
                this.score++;
            }

            this.selectedOption = null;
            this.currentQuestionIndex++;

            if (this.currentQuestionIndex === this.questions.length) {
                this.submitQuiz();
            }
        },
        async submitQuiz() {
            await fetch(`${location.origin}/api/scores`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization-Token": this.$store.state.auth_token
                },
                body: JSON.stringify({
                    quiz_id: this.quizId,
                    user_id: this.$store.state.user_id,
                    total_score: this.score
                })
            });
        },
        goBack() {
            this.$router.go(-1);
        }
    }
};
