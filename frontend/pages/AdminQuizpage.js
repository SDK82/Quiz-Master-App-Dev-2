export default {
    template: `
    <div class="container my-4">
        <h2 class="text-center mb-4">Quizzes for {{ chapterName || "Selected Chapter" }}</h2>

        <!-- Quiz List Table -->
        <div class="card shadow-sm p-3">
            <table class="table table-hover">
                <thead class="thead-dark">
                    <tr>
                        <th>#</th>
                        <th>Chapter</th>
                        <th>No of Questions</th>
                        <th>Date</th>
                        <th>Time Duration</th>
                        <th>Remarks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(quiz, index) in quizzes" :key="quiz.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ quiz.chapter_name }}</td>
                        <td>{{ quiz.no_of_questions }}</td>
                        <td>{{ formatDate(quiz.date_of_quiz) }}</td>
                        <td>{{ quiz.time_duration }}</td>
                        <td>{{ quiz.remarks }}</td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="editQuiz(quiz)">✏️ Edit</button>
                            <button class="btn btn-sm btn-danger" @click="confirmDelete(quiz.id)">🗑 Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
<!-- Centered Create Quiz Button -->
<div class="d-flex justify-content-center mt-3">
    <button class="btn btn-md btn-primary px-3" @click="createQuiz">
        + Create Quiz
    </button>
</div>

        <!-- Back Button -->
        <button class="btn btn-danger mt-3" @click="goBack">⬅️ Back</button>
    </div>
    `,
 data() {
        return {
            quizzes: [],  // Store quiz list
            chapterName: "" // Store chapter name
        };
    },
    async mounted() {
        await this.fetchQuizzes();
        console.log("Fetched quizzes:", );  // Debugging 
    },


    methods: {
        async fetchQuizzes() {
            const chapterId = this.$route.params.chapterId;
        
            if (!chapterId) {
                console.error("Chapter ID is missing!");
                return;
            }
        
            try {
                const response = await fetch(`${location.origin}/api/chapter/${chapterId}/quizzes`, {
                    headers: { 'Authorization-Token': this.$store.state.auth_token },
                });
        
                if (!response.ok) {
                    throw new Error(`No quizzes found ${response.statusText}`);
                }
        
                const quizzes = await response.json();
                this.quizzes = quizzes;
        
                if (quizzes.length > 0 && quizzes[0].chapter_name) {
                    this.chapterName = quizzes[0].chapter_name;
                } 
                
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        },



        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        },
        goBack() {
            this.$router.go(-1);
        },
        confirmDelete(quizId) {
            if (confirm("Are you sure you want to delete this quiz?")) {
                this.deleteQuiz(quizId);
            }
        },
        async deleteQuiz(quizId) {
            try {
                await fetch(`${location.origin}/api/quizzes/${quizId}`, {
                    method: "DELETE",
                    headers: { "Authorization-Token": this.$store.state.auth_token },
                });

                // ✅ Fetch updated quizzes after deleting one
                await this.fetchQuizzes();
                alert("Quiz deleted successfully!");
                
            } catch (error) {
                console.error("Error deleting quiz:", error);
            }

            },
            createQuiz() {
                this.$router.push('/admin/create-quiz');
            }
        
}
};
