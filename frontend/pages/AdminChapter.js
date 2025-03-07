import ChapterCard from "../components/ChapterCard.js";

export default {
  template: `
    <div class="container my-5">
        <!-- Heading -->
        <div v-if="chapters.length" class="text-center mb-5">
            <h1 class="display-4 fw-bold text-dark">Chapters in <span class="text-primary">{{ subjectName }}</span></h1>
        </div>

        <!-- Chapter List -->
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div 
                class="col" 
                v-for="chapter in chapters" 
                :key="chapter.id"
            >
                <div class="chapter-box p-4 rounded-lg shadow-sm bg-white text-center hover-effect">
                    <h4 class="text-primary fw-bold mb-3">{{ chapter.name }}</h4>
                    <p class="text-muted mb-4">
                        {{ chapter.description || 'No description available.' }}
                    </p>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-outline-primary btn-sm" @click.stop="goToQuizzes(chapter.id)">View Quizzes</button>
                        <button class="btn btn-outline-danger btn-sm" @click.stop="deleteChapter(chapter.id)">Delete</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Chapter Button -->
        <div class="text-center mt-5">
            <button class="btn btn-primary btn-lg" @click="showAddChapterModal = true">
                <i class="fas fa-plus me-2"></i>Add Chapter
            </button>
        </div>

        <!-- Go Back Button -->
        <div class="text-center mt-4">
            <button class="btn btn-secondary" @click="goBack">⬅️ Go Back</button>
        </div>

        <!-- No Chapters Message -->
        <div v-if="!chapters.length" class="text-center mt-5">
            <p class="lead text-muted">No chapters found for this subject.</p>
            <button class="btn btn-primary mt-3" @click="showAddChapterModal = true">Add Chapter</button>
        </div>

        <!-- Add Chapter Modal -->
        <div v-if="showAddChapterModal" class="modal-overlay">
            <div class="modal-content">
                <h3 class="mb-4">Add New Chapter</h3>
                <form @submit.prevent="addChapter">
                    <div class="mb-3">
                        <label for="chapterName" class="form-label">Chapter Name</label>
                        <input v-model="newChapter.name" type="text" id="chapterName" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="chapterDescription" class="form-label">Description</label>
                        <textarea v-model="newChapter.description" id="chapterDescription" class="form-control" rows="3" required></textarea>
                    </div>
                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-secondary" @click="showAddChapterModal = false">Cancel</button>
                        <button type="submit" class="btn btn-success">Add Chapter</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  `,

  data() {
    return {
      subjectName: "",
      chapters: [],
      showAddChapterModal: false,
      newChapter: { name: '', description: '', subject_id: '' }
    };
  },
  async mounted() {
    await this.fetchChapters();
  },
  methods: {
  async fetchQiuzzes() {
    const chapterId = this.$route.params.chapterId;
    const response = await fetch(
      `${location.origin}/api/chapters/${chapterId}/quizzes`,
      {
        headers: {
          "Authorization-Token": this.$store.state.auth_token,
        },
      })
    },
    
    async fetchChapters() {
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
    getChaptersForSubject(subjectId) {
      return this.chapters[subjectId] || [];
    },

    goToQuizzes(chapterId) {
      this.$router.push(`/admin/quizzes/${chapterId}`);
    },
    goBack() {
      this.$router.go(-1);
    },

    async addChapter() {
      try {
        this.newChapter.subject_id = this.$route.params.subjectId;

        if (this.chapters.some(chapter => chapter.name.toLowerCase() === this.newChapter.name.toLowerCase())) {
          alert('Chapter with the same name already exists');
          return;
        }

        const response = await fetch(`${location.origin}/api/chapters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization-Token': this.$store.state.auth_token
          },
          body: JSON.stringify(this.newChapter)
        });

        if (!response.ok) throw new Error('Failed to add chapter');

        const newChapterFromServer = await response.json();
        this.showAddChapterModal = false;
        this.newChapter = { name: '', description: '', subject_id: '' };
        this.chapters.push(newChapterFromServer);
        await this.fetchChapters();
      } catch (error) {
        console.error(error);
        alert('Error adding chapter');
      }
    },
    async deleteChapter(chapterId) {
      if (!confirm("Are you sure you want to delete this chapter?")) return;

      try {
        const response = await fetch(`${location.origin}/api/chapters/${chapterId}`, {
          method: 'DELETE',
          headers: {
            'Authorization-Token': this.$store.state.auth_token
          }
        });

        if (!response.ok) throw new Error('Failed to delete chapter');

        await this.fetchChapters();
      } catch (error) {
        console.error(error);
        alert('Error deleting chapter');
      }
    }
  },
  components: {
    ChapterCard,
  },
};