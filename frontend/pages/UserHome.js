import SubjectCard from "../components/SubjectCard.js";

export default {
    template: `
    <div class="container my-5">
    <h1 class="text-center mb-5" style="font-size: 2.5rem; font-weight: bold; color: #2c3e50;">Welcome to User Home</h1>
    <h2 class="text-center mb-5" style="font-size: 2rem; color: #2980b9;">Subjects</h2>
        <div class="row row-cols-2 row-cols-md-4 row-cols-lg-3 g-2 h-200">
            <div 
                class="col" 
                v-for="subject in subjects" 
                :key="subject.id" 
                @click="goToChapters(subject.id)" 
                style="cursor: pointer;"
            >
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title text-primary">{{ subject.name }}</h5>
                        <p class="card-text text-secondary">
                            {{ subject.description || 'No description available.' }}
                        </p>
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
            subjects: []
        };
    },
    async mounted() {
        const response = await fetch(location.origin + '/api/subjects', {
            headers: {
                'Authorization-Token': this.$store.state.auth_token
            },
        });
        this.subjects = await response.json();
    },
    methods: {
        goToChapters(subjectId) {
            this.$router.push(`/subject/${subjectId}/chapters`);
        }
    },
    components: {
        SubjectCard
    }
};
