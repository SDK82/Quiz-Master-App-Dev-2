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
                        <td>{{ quiz.time_duration || '00:00' }}</td>
                        <td>{{ quiz.remarks }}</td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditForm(quiz)">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-sm btn-danger" @click="confirmDelete(quiz.id)">
                                🗑 Delete
                            </button>
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

        <!-- Edit Quiz Modal -->
        <div v-if="showEditForm" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 500px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                <h3 class="text-center mb-3">Edit Quiz</h3>
                <form @submit.prevent="updateQuiz">
                    <div class="mb-3">
                        <label class="form-label">Chapter Name</label>
                        <input v-model="editQuizData.chapter_name" type="text" class="form-control" required disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">No. of Questions</label>
                        <input v-model="editQuizData.no_of_questions" type="number" class="form-control" required disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Date & Time</label>
                        <input v-model="editQuizData.date_of_quiz" type="datetime-local" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Time Duration</label>
                        <div class="d-flex gap-3">
                            <input v-model="editQuizData.minutes" type="number" min="0" class="form-control text-center" placeholder="Minutes" required>
                            <input v-model="editQuizData.seconds" type="number" min="0" max="59" class="form-control text-center" placeholder="Seconds" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Remarks</label>
                        <textarea v-model="editQuizData.remarks" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-secondary" @click="closeEditForm">Cancel</button>
                        <button type="submit" class="btn btn-success">Update Quiz</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            quizzes: [],
            chapterName: "",
            showEditForm: false,
            editQuizData: {
                id: null,
                chapter_name: "",
                no_of_questions: 0,
                date_of_quiz: "",
                minutes: 0,
                seconds: 0,
                remarks: "",
            },
            originalQuizData: {},
        };
    },
    
    async mounted() {
        await this.fetchQuizzes();
        console.log("Fetched quizzes:", this.quizzes); // Debugging
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
                this.quizzes = quizzes.map(quiz => ({
                    ...quiz,
                    time_duration: quiz.time_duration || "00:00", // Ensure a default value
                }));
        
                if (quizzes.length > 0 && quizzes[0].chapter_name) {
                    this.chapterName = quizzes[0].chapter_name;
                } 
                
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        },

        openEditForm(quiz) {
            this.editQuizData = { ...quiz };
            this.editQuizData.date_of_quiz = this.formatDateForInput(quiz.date_of_quiz);
            
            // Parse time_duration ("MM:SS") into minutes and seconds
            const [mins, secs] = (quiz.time_duration || "00:00").split(':').map(Number);
            this.editQuizData.minutes = isNaN(mins) ? 0 : mins;
            this.editQuizData.seconds = isNaN(secs) ? 0 : secs;

            this.originalQuizData = { ...quiz };
            this.showEditForm = true;
        },
        
        formatDateForInput(dateString) {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
        },

        async updateQuiz() {
            try {
                const quizId = this.editQuizData.id;
                if (!quizId) {
                    alert("Invalid quiz data!");
                    return;
                }

                // Format time_duration as "MM:SS"
                const formattedTimeDuration = `${String(this.editQuizData.minutes).padStart(2, '0')}:${String(this.editQuizData.seconds).padStart(2, '0')}`;

                // Prepare updated fields
                let updatedFields = {};
                if (this.editQuizData.date_of_quiz !== this.formatDateForInput(this.originalQuizData.date_of_quiz)) {
                    updatedFields.date_of_quiz = this.editQuizData.date_of_quiz.replace("T", " ") + ":00";
                }
                if (formattedTimeDuration !== (this.originalQuizData.time_duration || "00:00")) {
                    updatedFields.time_duration = formattedTimeDuration;
                }
                if (this.editQuizData.remarks !== this.originalQuizData.remarks) {
                    updatedFields.remarks = this.editQuizData.remarks;
                }

                if (Object.keys(updatedFields).length === 0) {
                    alert("No changes detected.");
                    return;
                }

                const response = await fetch(`${location.origin}/api/quizzes/${quizId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization-Token": this.$store.state.auth_token,
                    },
                    body: JSON.stringify(updatedFields),
                });

                if (!response.ok) throw new Error("Failed to update quiz");

                alert("Quiz updated successfully!");
                await this.fetchQuizzes();
                this.showEditForm = false;

            } catch (error) {
                console.error("Error updating quiz:", error);
                alert("Error updating quiz");
            }
        },

        closeEditForm() {
            this.showEditForm = false;
            this.editQuizData = {
                id: null,
                chapter_name: "",
                no_of_questions: 0,
                date_of_quiz: "",
                minutes: 0,
                seconds: 0,
                remarks: "",
            };
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