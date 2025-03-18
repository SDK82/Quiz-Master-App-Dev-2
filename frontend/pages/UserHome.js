export default {
    template: `
    <div class="container my-5">
        <h1 class="text-center mb-5" style="font-size: 2.5rem; font-weight: bold; color: #2c3e50;">Welcome {{$store.state.full_name}}</h1>
        <h2 class="text-center mb-5" style="font-size: 2rem; color: #2980b9;">Subjects</h2>
        
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            <div 
                class="col" 
                v-for="subject in subjects" 
                :key="subject.id" 
                @click="goToChapters(subject.id)" 
                style="cursor: pointer;"
            >
                <div class="card h-100 shadow-sm">
                <div v-if="subject.image" class="card-img-top" style="height: 150px; overflow: hidden;">
                <img :src="subject.image" :alt="subject.name" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                    <div class="card-body">
                        <h5 class="card-title text-primary text-center">{{ subject.name }}</h5>
                        <p class="card-text text-secondary text-center">
                            {{ subject.description || 'No description available.' }}
                        </p>
                        <div class="border rounded overflow-hidden">
                        <table v-if="getChaptersForSubject(subject.id).length" class="table table-hover mt-3">
                            <thead>
                                <tr>
                                    <th>Chapter Name</th>
                                    <th>No of Quizzes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="chapter in getChaptersForSubject(subject.id)" :key="chapter.id">
                                    <td>{{ chapter.name }}</td>
                                    <td>{{ chapter.no_of_questions }}</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger display-flex " @click.stop="goToQuizzes(chapter.id)">View</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                        <p v-else class="text-muted">No chapters available.</p>
                    </div>
                    <div class="card-footer bg-white">
                        <button class="btn btn-outline-primary w-100">View Chapters</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            subjects: [],
            chapters: {}  // Initialize as an object for easy lookup
        };
    },

    async mounted() {
        await this.fetchSubjects();
        console.log("Vuex Store:", this.$store.state); 
        console.log("Username:", this.$store.state.user_name);
    
    },

    methods: {
        async fetchSubjects() {
            try {
                const response = await fetch(`${location.origin}/api/subjects`, {
                    headers: { 'Authorization-Token': this.$store.state.auth_token }
                });
                this.subjects = await response.json();

                // Fetch chapters for each subject
                for (const subject of this.subjects) {
                    this.fetchChapters(subject.id);
                    const user_id = this.$store.state;
                    console.log("User ID:", user_id);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        },

        async fetchChapters(subjectId) {
            try {
                const response = await fetch(`${location.origin}/api/subjects/${subjectId}/chapters`, {
                    headers: { 'Authorization-Token': this.$store.state.auth_token }
                });
                const chaptersData = await response.json();

                // Store chapters per subject ID
                this.$set(this.chapters, subjectId, chaptersData);
            } catch (error) {
                console.error(`Error fetching chapters for subject ${subjectId}:`, error);
            }
        },

        getChaptersForSubject(subjectId) {
            return this.chapters[subjectId] || [];
        },

        goToChapters(subjectId) {
            this.$router.push(`/subject/${subjectId}/chapters`);
        },

        goToQuizzes(chapterId) {
            this.$router.push(`/chapter/${chapterId}/quizzes`);
        }
    }
};
