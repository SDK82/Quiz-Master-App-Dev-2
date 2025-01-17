import SubjectCard from "../components/SubjectCard.js";

export default {
    template: `
    <div class="container" @click="goToChapters(subject.id)">
        <h1>User Home</h1>
        <h2>Subjects</h2>
        <div>
            <SubjectCard 
                v-for="subject in subjects" 
                :key="subject.id"
                :name="subject.name" 
                :description="subject.description" 
                :id="subject.id"
                
            />
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
