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
                            <p class="card-text"><strong>No of Questions:</strong> {{ quiz.no_of_questions || 0 }}</p>
                            <p class="card-text"><strong>Duration:</strong> {{ quiz.time_duration }} minutes</p>
                            <p class="card-text"><strong>Difficulty:</strong> {{ quiz.difficulty }}</p>
                            <p class="card-text"><strong>Remarks:</strong> {{ quiz.remarks || 'No remarks available' }}</p>
                            <p class="card-text"><strong>Start Date:</strong> {{ formatDate(quiz.date_of_quiz) }}</p>
                            <p class="card-text"><strong>Created At:</strong> {{ formatDate(quiz.created_at) }}</p>
                            <!-- Conditionally render the Start Quiz button -->
                            <router-link 
                                v-if="isQuizAvailable(quiz.date_of_quiz)" 
                                :to="'/quiz/' + quiz.id" 
                                class="btn btn-sm btn-outline-primary w-100"
                            >
                                Start Quiz
                            </router-link>
                            <p v-else class="text-danger">Quiz not yet available.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="btn btn-danger" @click="goBack">⬅️ Go Back</button>
    </div>
    `,

    data() {
        return {
            quizzes: [],
            chapterName: ""
        };
    },

    async mounted() {
        const chapterId = this.$route.params.chapterId;
        const response = await fetch(`${location.origin}/api/chapter/${chapterId}/quizzes`, {
            headers: {
                'Authorization-Token': this.$store.state.auth_token
            },
        });
    
        const quizzes = await response.json();
        this.quizzes = quizzes;
    
        if (quizzes.length > 0 && quizzes[0].chapter_name) {
            this.chapterName = quizzes[0].chapter_name;
        }


    },

    methods: {
        
        formatDate(dateString) {
            if (!dateString) return "N/A";
            const date = new Date(dateString);
            return date.getUTCDate().toString().padStart(2, '0') + '/' + 
                    (date.getUTCMonth() + 1).toString().padStart(2, '0') + '/' + 
                    date.getUTCFullYear() + ' ' +
                    date.getUTCHours().toString().padStart(2, '0') + ':' +
                    date.getUTCMinutes().toString().padStart(2, '0');
        },
        
        goBack() {
            this.$router.go(-1);
        },
        isQuizAvailable(dateOfQuiz) {
            if (!dateOfQuiz) return false; // If no date is provided, quiz is unavailable
        
            console.log('Date of Quiz:', dateOfQuiz); // Debugging: Check the format
        
            // Convert the dateOfQuiz string to a Date object (in UTC)
            const quizDate = new Date(dateOfQuiz);
        
            // Check if the date is valid
            if (isNaN(quizDate.getTime())) {
                console.error('Invalid date format:', dateOfQuiz);
                return false;
            }
        
            // Get the current local time
            const currentDateLocal = new Date();
        
            // Convert the quiz date (UTC) to local time for comparison
            const quizDateLocal = new Date(
                quizDate.getUTCFullYear(),
                quizDate.getUTCMonth(),
                quizDate.getUTCDate(),
                quizDate.getUTCHours(),
                quizDate.getUTCMinutes(),
                quizDate.getUTCSeconds()
            );
        
            console.log('Current Local Time:', currentDateLocal.toString());
            console.log('Quiz Local Time:', quizDateLocal.toString());
        
            // Compare the dates
            return currentDateLocal >= quizDateLocal;
        }
        
    }
};
