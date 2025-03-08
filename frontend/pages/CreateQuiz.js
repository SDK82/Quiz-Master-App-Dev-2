export default {
    template: `
    <div class="container my-5">
        <h1 class="text-center mb-5 fw-bold text-primary">Create a New Quiz</h1>

        <!-- Quiz Form -->
        <form @submit.prevent="createQuiz" class="bg-white p-5 rounded shadow-lg">
            <div class="row g-4">
                <!-- Subject Dropdown -->
                <div class="col-md-6">
                    <label for="subjectId" class="form-label fw-bold">Select Subject</label>
                    <select v-model="selectedSubjectId" id="subjectId" class="form-select form-select-lg" required @change="fetchChaptersBySubject">
                        <option value="" disabled>Select a subject</option>
                        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                            {{ subject.name }}
                        </option>
                    </select>
                </div>

                <!-- Chapter Dropdown -->
                <div class="col-md-6">
                    <label for="chapterId" class="form-label fw-bold">Select Chapter</label>
                    <select v-model="quiz.chapter_id" id="chapterId" class="form-select form-select-lg" required :disabled="!selectedSubjectId">
                        <option value="" disabled>Select a chapter</option>
                        <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                            {{ chapter.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="row g-4 mt-3">
                <div class="col-md-6">
                    <label for="remarks" class="form-label fw-bold">Quiz Title / Remarks</label>
                    <input v-model="quiz.remarks" type="text" id="remarks" class="form-control form-control-lg" placeholder="Enter quiz title" required>
                </div>
                <div class="col-md-6">
                    <label for="dateOfQuiz" class="form-label fw-bold">Date & Time</label>
                    <input v-model="quiz.date_of_quiz" type="datetime-local" id="dateOfQuiz" class="form-control form-control-lg" required>
                </div>
            </div>

            <!-- Time Duration Section -->
            <div class="row g-4 mt-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Time Duration</label>
                    <div class="d-flex gap-3">
                        <input v-model="quiz.minutes" type="number" min="0" class="form-control form-control-lg text-center" placeholder="Minutes" required>
                        <input v-model="quiz.seconds" type="number" min="0" max="59" class="form-control form-control-lg text-center" placeholder="Seconds" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <label for="difficulty" class="form-label fw-bold">Difficulty Level</label>
                    <select v-model="quiz.difficulty" id="difficulty" class="form-select form-select-lg" required>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            <!-- Questions Section -->
            <h3 class="mt-5 mb-4 text-primary fw-bold">Quiz Questions</h3>
            <div v-for="(question, index) in quiz.questions" :key="index" class="mb-4 p-4 border rounded shadow-sm bg-light">
                <h5 class="text-secondary fw-bold">Question {{ index + 1 }}</h5>
                <textarea v-model="question.question_statement" class="form-control form-control-lg mb-3" rows="2" placeholder="Enter question text" required></textarea>

                <div class="row g-3">
                    <div class="col-md-6">
                        <input v-model="question.option1" type="text" class="form-control form-control-lg" placeholder="Option 1" required>
                    </div>
                    <div class="col-md-6">
                        <input v-model="question.option2" type="text" class="form-control form-control-lg" placeholder="Option 2" required>
                    </div>
                    <div class="col-md-6">
                        <input v-model="question.option3" type="text" class="form-control form-control-lg" placeholder="Option 3" required>
                    </div>
                    <div class="col-md-6">
                        <input v-model="question.option4" type="text" class="form-control form-control-lg" placeholder="Option 4" required>
                    </div>
                </div>

                <label class="form-label fw-bold mt-3">Correct Answer</label>
                <select v-model="question.correct_option" class="form-select form-select-lg" required>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                    <option value="4">Option 4</option>
                </select>

                <button type="button" class="btn btn-danger mt-3 w-100" @click="removeQuestion(index)">Remove Question</button>
            </div>

            <!-- Add Question Button -->
            <button type="button" class="btn btn-outline-primary btn-lg w-100 mt-3" @click="addQuestion">
                + Add Question
            </button>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-success btn-lg w-100 mt-4">Create Quiz</button>
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
                difficulty: 'medium', // Default difficulty
            },
            subjects: [], // To store subjects fetched from the API
            chapters: [], // To store chapters fetched from the API
            selectedSubjectId: null, // To store the selected subject ID
        };
    },
    async mounted() {
        await this.fetchSubjects();
    },
    methods: {
        // Fetch all subjects
        async fetchSubjects() {
            try {
                const response = await fetch(`${location.origin}/api/subjects`, {
                    headers: { 'Authorization-Token': this.$store.state.auth_token },
                });
                if (!response.ok) throw new Error('Failed to fetch subjects');
                this.subjects = await response.json();
            } catch (error) {
                console.error(error);
                alert('Error fetching subjects');
            }
        },

        // Fetch chapters by selected subject
        async fetchChaptersBySubject() {
            if (!this.selectedSubjectId) return;

            try {
                const response = await fetch(`${location.origin}/api/subjects/${this.selectedSubjectId}/chapters`, {
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
                        difficulty: this.quiz.difficulty,
                    }),
                });

                if (!quizResponse.ok) throw new Error('Failed to create quiz');

                const quizData = await quizResponse.json();
                const quizId = quizData.id;

                // Add questions to the quiz
                if (this.quiz.questions.length === 0) {
                    alert('Please add questions to the quiz');
                    return;
                }
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
}