import ChapterCard from "../components/ChapterCard.js";

export default {
    template: `
    <div class="container">
        <h1>Chapters for {{ subjectName }}</h1>
        <div v-if="chapters.length">
            <ChapterCard 
                v-for="chapter in chapters" 
                :key="chapter.id"
                :name="chapter.name" 
                :description="chapter.description" 
                :id="chapter.id"
                @click="goToQuizzes(chapter.id)"
            />
        </div>
        <div v-else>
            <p>No chapters found.</p>
        </div>
    </div>
    `,
    data() {
        return {
            subjectName: "",
            chapters: []
        };
    },
    async mounted() {
        const subjectId = this.$route.params.subjectId;
        const response = await fetch(`${location.origin}/api/subjects/${subjectId}/chapters`, {
            headers: {
                'Authorization-Token': this.$store.state.auth_token
            },
        });
        const data = await response.json();
        
        if (data.length > 0) {
            this.subjectName = data[0].subject_name; // Assuming subject_name is available
        } else {
            this.subjectName = "Unknown Subject";
        }

        this.chapters = data;
    },
    methods: {
        goToQuizzes(chapterId) {
            this.$router.push(`/chapter/${chapterId}/quizzes`);
        }
    },
    components: {
        ChapterCard
    }
};
