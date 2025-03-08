export default {
    template: `
  
    <div class="container my-5">
        <!-- Header Section -->
        <h1 class="text-center mb-5" style="font-size: 2.5rem; font-weight: bold; color: #2c3e50;">
            Welcome to Admin Home
        </h1>
        <h2 class="text-center mb-5" style="font-size: 2rem; color: #2980b9;">Subjects</h2>

        <!-- Create Quiz Button -->
        <div class="d-flex justify-content-end mb-4">
            <button class="btn btn-primary" @click="createQuiz">
                + Create Quiz
            </button>
        </div>

        <!-- Subjects Grid -->
        <div class="row row-cols-2 row-cols-md-4 row-cols-lg-3 g-2 h-200">
            <div class="col" v-for="subject in subjects" :key="subject.id" style="cursor: pointer;">
                <div class="card h-100 shadow-sm">
                    <!-- Subject Image -->
                    <div v-if="subject.image" class="card-img-top" style="height: 150px; overflow: hidden;">
                        <img :src="subject.image" :alt="subject.name" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-primary text-center">{{ subject.name }}</h5>
                        <p class="card-text text-muted text-center">{{ subject.description }}</p>
                        <div class="border rounded overflow-hidden">
                        <table v-if="getChaptersForSubject(subject.id).length" class="table table-hover mt-3">
                            <tr>
                                <th>Chapter Name</th>
                                <th>No of Quizzes</th>
                                <th>Actions</th>
                            </tr>
                            <tr v-for="chapter in getChaptersForSubject(subject.id)" :key="chapter.id">
                                <td>{{ chapter.name }}</td>
                                <td>{{ chapter.no_of_questions }}</td>
                                <td>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-outline-primary" @click="goToQuizzes(chapter.id)">
                                            View Quizzes
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="deleteChapter(chapter.id, subject.id)">
                                            Delete Chapter
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        </div>
                        <p v-else class="text-muted">No chapters available.</p>
                    </div>
                    <div class="card-footer bg-white d-flex gap-2">
                        <button class="btn btn-outline-primary w-50" @click="goToChapters(subject.id)">
                            View Chapters
                        </button>
                        <button class="btn btn-outline-danger w-50" @click="deleteSubject(subject.id)">
                            Delete Subject
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Subject Button -->
        <div class="text-center mt-5">
            <button class="btn btn-primary" @click="showAddSubjectModal = true">+ Add Subject</button>
        </div>

        <!-- Add Subject Modal -->
        <div v-if="showAddSubjectModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                <h3 class="mb-3">Add New Subject</h3>
                <form @submit.prevent="addSubject">
                    <div class="mb-3">
                        <label for="subjectName" class="form-label">Subject Name</label>
                        <input v-model="newSubject.name" type="text" id="subjectName" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="subjectDescription" class="form-label">Description</label>
                        <textarea v-model="newSubject.description" id="subjectDescription" class="form-control" required></textarea>
                    </div>
                    <!-- Image Upload -->
                    <div class="mb-3">
                        <label class="form-label">Upload Image</label>
                        <input type="file" @change="handleFileUpload" accept="image/*" />
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-secondary me-2" @click="showAddSubjectModal = false">Cancel</button>
                        <button type="submit" class="btn btn-success">Add Subject</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    `,
    data() {
        return {
            subjects: [],
            chapters: {}, // Store chapters per subject
            showAddSubjectModal: false,
            newSubject: { name: '', description: '', image: null }, // Store the file
        };
    },
    async mounted() {
        await this.fetchSubjects();
    },
    methods: {
        async fetchSubjects() {
            const response = await fetch(`${location.origin}/api/subjects`, {
                headers: { 'Authorization-Token': this.$store.state.auth_token }
            });
            this.subjects = await response.json();

            // Fetch chapters for all subjects
            for (let subject of this.subjects) {
                await this.fetchChapters(subject.id);
            }
        },

        async fetchChapters(subjectId) {
            const response = await fetch(`${location.origin}/api/subjects/${subjectId}/chapters`, {
                headers: { 'Authorization-Token': this.$store.state.auth_token }
            });
            this.$set(this.chapters, subjectId, await response.json());
        },

        getChaptersForSubject(subjectId) {
            return this.chapters[subjectId] || [];
        },

        async deleteSubject(subjectId) {
            if (!confirm("Are you sure you want to delete this subject?")) return;

            try {
                const response = await fetch(`${location.origin}/api/subjects/${subjectId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization-Token': this.$store.state.auth_token }
                });

                if (!response.ok) throw new Error('Failed to delete subject');

                await this.fetchSubjects();
            } catch (error) {
                console.error(error);
                alert('Error deleting subject');
            }
        },

        async deleteChapter(chapterId, subjectId) {
            if (!confirm("Are you sure you want to delete this chapter?")) return;

            try {
                const response = await fetch(`${location.origin}/api/chapters/${chapterId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization-Token': this.$store.state.auth_token }
                });

                if (!response.ok) throw new Error('Failed to delete chapter');

                await this.fetchChapters(subjectId);
            } catch (error) {
                console.error(error);
                alert('Error deleting chapter');
            }
        },

        async addSubject() {
            try {
                // Create FormData object
                const formData = new FormData();
                formData.append('name', this.newSubject.name);
                formData.append('description', this.newSubject.description);
                if (this.newSubject.image) {
                    formData.append('image', this.newSubject.image); // Append the image file
                }
        
                const response = await fetch(`${location.origin}/api/subjects`, {
                    method: 'POST',
                    headers: {
                        'Authorization-Token': this.$store.state.auth_token, // Add auth token if needed
                    },
                    body: formData, // Use FormData for file upload
                });
        
                if (!response.ok) throw new Error('Failed to add subject');
        
                // Reset form and close modal
                this.showAddSubjectModal = false;
                this.newSubject = { name: '', description: '', image: null };
                await this.fetchSubjects(); // Refresh the subject list
            } catch (error) {
                console.error(error);
                alert('Error adding subject');
            }
        },

        goToQuizzes(chapterId) {
            this.$router.push(`/chapter/${chapterId}/quizzes`);
        },

        goToChapters(subjectId) {
            this.$router.push(`/admin/${subjectId}/chapters`);
        },

        createQuiz() {
            this.$router.push('/admin/create-quiz');
        },

        handleFileUpload(event) {
            this.newSubject.image = event.target.files[0]; // Capture selected image
        },
    }
};