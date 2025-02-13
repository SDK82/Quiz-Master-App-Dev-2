export default {
    template: `
    <div class="container my-5">
        <h1 class="text-center mb-5" style="font-size: 2.5rem; font-weight: bold; color: #2c3e50;">
            Create Quiz
        </h1>

        <!-- Quiz Form -->
        <form @submit.prevent="createQuiz">
            <div class="mb-3">
                <label for="chapterId" class="form-label">Chapter</label>
                <select v-model="quiz.chapter_id" id="chapterId" class="form-select" required>
                    <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                        {{ chapter.name }}
                    </option>
                </select>
            </div>
            <div class="mb-3">
                <label for="remarks" class="form-label">Remarks</label>
                <input v-model="quiz.remarks" type="text" id="remarks" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="dateOfQuiz" class="form-label">Date of Quiz</label>
                <input v-model="quiz.date_of_quiz" type="datetime-local" id="dateOfQuiz" class="form-control" required>
            </div>

            <!-- Time Duration Section (Separate Fields for Minutes & Seconds) -->
            <div class="mb-3">
                <label class="form-label">Time Duration</label>
                <div class="d-flex">
                    <input v-model="quiz.minutes" type="number" min="0" id="timeMinutes" class="form-control me-2" placeholder="Minutes" required>
                    <input v-model="quiz.seconds" type="number" min="0" max="59" id="timeSeconds" class="form-control" placeholder="Seconds" required>
                </div>
            </div>

            <!-- Questions Section -->
            <h3 class="mt-5 mb-3">Questions</h3>
            <div v-for="(question, index) in quiz.questions" :key="index" class="mb-4 border p-3 rounded">
                <div class="mb-3">
                    <label :for="'question-' + index" class="form-label">Question {{ index + 1 }}</label>
                    <textarea v-model="question.question_statement" :id="'question-' + index" class="form-control" required></textarea>
                </div>
                <div class="mb-3">
                    <label :for="'option1-' + index" class="form-label">Option 1</label>
                    <input v-model="question.option1" :id="'option1-' + index" type="text" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label :for="'option2-' + index" class="form-label">Option 2</label>
                    <input v-model="question.option2" :id="'option2-' + index" type="text" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label :for="'option3-' + index" class="form-label">Option 3</label>
                    <input v-model="question.option3" :id="'option3-' + index" type="text" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label :for="'option4-' + index" class="form-label">Option 4</label>
                    <input v-model="question.option4" :id="'option4-' + index" type="text" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label :for="'correctOption-' + index" class="form-label">Correct Option</label>
                    <select v-model="question.correct_option" :id="'correctOption-' + index" class="form-select" required>
                        <option value="1">Option 1</option>
                        <option value="2">Option 2</option>
                        <option value="3">Option 3</option>
                        <option value="4">Option 4</option>
                    </select>
                </div>
                <button type="button" class="btn btn-danger" @click="removeQuestion(index)">Remove Question</button>
            </div>

            <!-- Add Question Button -->
            <button type="button" class="btn btn-primary mb-4" @click="addQuestion">Add Question</button>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-success">Create Quiz</button>
        </form>
    </div>
    `,
    data() {
        return {
            quiz: {
                chapter_id: null,
                remarks: '',
                date_of_quiz: '',
                minutes: '', // Minutes input field
                seconds: '', // Seconds input field
                questions: [],
            },
            chapters: [], // To store chapters fetched from the API
        };
    },
    async mounted() {
        await this.fetchChapters();
    },
    methods: {
        async fetchChapters() {
            try {
                const response = await fetch(`${location.origin}/api/chapters`, {
                    headers: { 'Authorization-Token': this.$store.state.auth_token },
                });
                if (!response.ok) throw new Error('Failed to fetch chapters');
                this.chapters = await response.json();
            } catch (error) {
                console.error(error);
                alert('Error fetching chapters');
            }
        },

        addQuestion() {
            this.quiz.questions.push({
                question_statement: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correct_option: 1,
            });
        },

        removeQuestion(index) {
            this.quiz.questions.splice(index, 1);
        },

        async createQuiz() {
            try {
                // Convert Date Format for Database
                const formattedDate = this.quiz.date_of_quiz.replace("T", " ") + ":00"; 

                // Format Time Duration as "MM:SS"
                const formattedTimeDuration = `${String(this.quiz.minutes).padStart(2, '0')}:${String(this.quiz.seconds).padStart(2, '0')}`;

                // Create the quiz
                const quizResponse = await fetch(`${location.origin}/api/quizzes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify({
                        chapter_id: this.quiz.chapter_id,
                        remarks: this.quiz.remarks,
                        date_of_quiz: formattedDate,
                        time_duration: formattedTimeDuration, // Store as MM:SS format
                    }),
                });

                if (!quizResponse.ok) throw new Error('Failed to create quiz');

                const quizData = await quizResponse.json();
                const quizId = quizData.id;

                // Add questions to the quiz
                for (const question of this.quiz.questions) {
                    const questionResponse = await fetch(`${location.origin}/api/questions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization-Token': this.$store.state.auth_token,
                        },
                        body: JSON.stringify({
                            ...question,
                            quiz_id: quizId,
                        }),
                    });

                    if (!questionResponse.ok) throw new Error('Failed to add question');
                }

                alert('Quiz and questions created successfully!');
                this.$router.push('/'); // Redirect to admin dashboard
            } catch (error) {
                console.error(error);
                alert('Error creating quiz or questions');
            }
        },
    },
};
