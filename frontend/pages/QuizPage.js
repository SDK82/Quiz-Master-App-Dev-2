export default {
    props: ["chapterId"], // Receive chapter ID from route
    template: `
    <div class="container my-4">
        <div v-if="quizzes.length === 0" class="text-center">
            <p class="text-muted">No quizzes available for this chapter.</p>
            <button class="btn btn-primary" @click="goBack">Go Back</button>
        </div>
        <div v-else>
            <h1 class="mb-4 text-center">Quizzes for Chapter: {{ chapterName }}</h1>
            <div class="row">
                <div v-for="quiz in quizzes" :key="quiz.id" class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title text-primary">Quiz ID: {{ quiz.id }}</h5>
                            <p class="card-text"><strong>Date:</strong> {{ formatDate(quiz.date_of_quiz) }}</p>
                            <p class="card-text"><strong>Duration:</strong> {{ quiz.time_duration }} minutes</p>
                            <p class="card-text"><strong>Remarks:</strong> {{ quiz.remarks || 'No remarks available' }}</p>
                            <router-link :to="'/quiz/' + quiz.id" class="btn btn-sm btn-outline-primary w-100">Start Quiz</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            quizzes: [],  // Store quiz list
            chapterName: "" // Store chapter name
        };
    },
    async mounted() {
        const chapterId = this.$route.params.chapterId; // Get chapter ID from route
        const response = await fetch(`${location.origin}/api/chapter/${chapterId}/quizzes`, {
            headers: {
                'Authorization-Token': this.$store.state.auth_token
            },
        });

        const quizzes = await response.json();
        this.quizzes = quizzes;

        // Fetch chapter name if available
        if (quizzes.length > 0 && quizzes[0].chapter_name) {
            this.chapterName = quizzes[0].chapter_name;
        }
    },
    methods: {
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString(); // Format date as per user's locale
        },
        goBack() {
            this.$router.go(-1); // Go back to the previous page
        }
    }
};