import SubjectCard from "../components/SubjectCard.js";

export default {
    template: `
    <div class="container">
    <div>
        <h1>User Home</h1>
        <h1>Subjects</h1>
        <SubjectCard v-for="subject in subjects" :name="subject.name" :description="subject.description" :id="subject.id"/>
    </div>
    </div>
    `,
    data() {
        return {
            subjects: []
        }
    },
    async mounted() {
        
            const response = await fetch(location.origin + '/api/subjects', {
                headers: {
                    'Authorization-Token' : this.$store.state.auth_token                },
            });

            this.subjects = await response.json();
        
    },
    components: {
        SubjectCard,
    }
}
