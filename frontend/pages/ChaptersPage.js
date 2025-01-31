import ChapterCard from "../components/ChapterCard.js";

export default {
  template: `
    <div class="container my-5">
        <div v-if="chapters.length" class="text-center mb-4">
            <h1 class="display-4 fw-bold text-dark">Chapters in <span class="text-primary">{{ subjectName }}</span></h1>
        

        <div  class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div 
                class="col chapter-card" 
                v-for="chapter in chapters" 
                :key="chapter.id"
                @click="goToQuizzes(chapter.id)"
            >
                <div class="card h-100 shadow-lg border-0 rounded-lg">
                    <div class="card-body text-center">
                        <h4 class="card-title text-primary fw-bold">{{ chapter.name }}</h4>
                        <p class="card-text text-muted">
                            {{ chapter.description || 'No description available.' }}
                        </p>
                    </div>
                    <div class="card-footer bg-white border-0 text-center">
                        <button class="btn btn-outline-primary w-75 py-2 fw-semibold">View Quizzes</button>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <div v-else class="text-center mt-5">
            <p class="lead text-muted">No chapters found for this subject.</p>
            <button class="btn btn-primary" @click="goBack">Go Back</button>
        </div>
    </div>
`,

  style: `
.chapter-card {
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}
.chapter-card:hover {
    transform: scale(1.05);
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.15);
}
.card {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
`,

  data() {
    return {
      subjectName: "",
      chapters: [],
    };
  },
  async mounted() {
    const subjectId = this.$route.params.subjectId;
    const response = await fetch(
      `${location.origin}/api/subjects/${subjectId}/chapters`,
      {
        headers: {
          "Authorization-Token": this.$store.state.auth_token,
        },
      }
    );
    const data = await response.json();

    if (data.length > 0 && data[0].subject_name) {
      this.subjectName = data[0].subject_name; // Assuming subject_name is available
    } else {
      this.subjectName = "Unknown Subject";
    }

    this.chapters = data;
  },
  methods: {
    goToQuizzes(chapterId) {
      this.$router.push(`/chapter/${chapterId}/quizzes`);
    },
    goBack() {
      this.$router.go(-1);
    }
  },
  components: {
    ChapterCard,
  },
};
