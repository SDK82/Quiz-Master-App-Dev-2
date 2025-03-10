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
            <div v-for="chapter in chapters" :key="chapter.id" class="col">
                <div class="chapter-box p-4 rounded-lg shadow-sm bg-white text-center hover-effect transition-all border border-3">
                    <h4 class="text-primary fw-bold mb-3">{{ chapter.name }}</h4>
                    <p class="text-muted mb-4">
                        {{ chapter.description || 'No description available.' }}
                    </p>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-outline-primary btn-sm" @click="goToQuizzes(chapter.id)">View Quizzes</button>
                        <button class="btn btn-outline-danger btn-sm" @click="deleteChapter(chapter.id)">Delete</button>
                        <button class="btn btn-outline-success btn-sm" @click="editChapter(chapter.id)">Edit</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Chapter Button -->
        <div class="text-center mt-5">
            <button class="btn btn-primary btn-lg" @click="showAddChapterModal = true">
                Add Chapter
            </button>
        </div>

        <!-- Go Back Button -->
        <div class="mt-4">
            <button class="btn btn-danger" @click="goBack">⬅️ Go Back</button>
        </div>

        <!-- No Chapters Message -->
        <div v-else class="text-center mt-5">
            <p class="lead text-muted">No chapters found for this subject.</p>
            <button class="btn btn-primary mt-3" @click="showAddChapterModal = true">Add Chapter</button>
        </div>

        <!-- Add Chapter Modal -->
        <div v-if="showAddChapterModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                <h3 class="mb-4 text-center">Add New Chapter</h3>
                <form @submit.prevent="addChapter">
                    <div class="mb-3">
                        <label class="form-label">Chapter Name</label>
                        <input v-model="newChapter.name" type="text" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea v-model="newChapter.description" class="form-control" rows="4" required></textarea>
                    </div>
                    <div class="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" class="btn btn-secondary" @click="closeAddModal">Cancel</button>
                        <button type="submit" class="btn btn-success">Add Chapter</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Edit Chapter Modal -->
        <div v-if="showEditChapterModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                <h3 class="mb-4 text-center">Edit Chapter</h3>
                <form @submit.prevent="updateChapter">
                    <div class="mb-3">
                        <label class="form-label">Chapter Name</label>
                        <input v-model="editChapterData.name" type="text" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea v-model="editChapterData.description" class="form-control" rows="4" required></textarea>
                    </div>
                    <div class="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" class="btn btn-secondary" @click="closeEditModal">Cancel</button>
                        <button type="submit" class="btn btn-success">Update Chapter</button>
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
      showEditChapterModal: false,
      newChapter: { name: "", description: "", subject_id: "" },
      editChapterData: { id: null, name: "", description: "" },
    };
  },

  async mounted() {
    await this.fetchChapters();
  },

  methods: {
    async fetchChapters() {
      try {
        const subjectId = this.$route.params.subjectId;
        const response = await fetch(`${location.origin}/api/subjects/${subjectId}/chapters`, {
          headers: { "Authorization-Token": this.$store.state.auth_token },
        });
        const data = await response.json();

        this.subjectName = data.length > 0 && data[0].subject_name ? data[0].subject_name : "Unknown Subject";
        this.chapters = data;
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    },

    async addChapter() {
      try {
        this.newChapter.subject_id = this.$route.params.subjectId;

        if (this.chapters.some(ch => ch.name.toLowerCase() === this.newChapter.name.toLowerCase())) {
          alert("Chapter with the same name already exists");
          return;
        }

        const response = await fetch(`${location.origin}/api/chapters`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization-Token": this.$store.state.auth_token,
          },
          body: JSON.stringify(this.newChapter),
        });

        if (!response.ok) throw new Error("Failed to add chapter");

        this.closeAddModal();
        await this.fetchChapters();
      } catch (error) {
        console.error(error);
        alert("Error adding chapter");
      }
    },

    async deleteChapter(chapterId) {
      if (!confirm("Are you sure you want to delete this chapter?")) return;

      try {
        const response = await fetch(`${location.origin}/api/chapters/${chapterId}`, {
          method: "DELETE",
          headers: { "Authorization-Token": this.$store.state.auth_token },
        });

        if (!response.ok) throw new Error("Failed to delete chapter");

        await this.fetchChapters();
      } catch (error) {
        console.error(error);
        alert("Error deleting chapter");
      }
    },

    editChapter(chapterId) {
      const chapter = this.chapters.find(ch => ch.id === chapterId);
      if (chapter) {
        this.editChapterData = { ...chapter };
        this.showEditChapterModal = true;
      }
    },

    async updateChapter() {
      try {
        const response = await fetch(`${location.origin}/api/chapters/${this.editChapterData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization-Token": this.$store.state.auth_token,
          },
          body: JSON.stringify(this.editChapterData),
        });

        if (!response.ok) throw new Error("Failed to update chapter");

        this.closeEditModal();
        await this.fetchChapters();
      } catch (error) {
        console.error(error);
        alert("Error updating chapter");
      }
    },

    closeAddModal() {
      this.showAddChapterModal = false;
      this.newChapter = { name: "", description: "", subject_id: "" };
    },

    closeEditModal() {
      this.showEditChapterModal = false;
      this.editChapterData = { id: null, name: "", description: "" };
    },

    goToQuizzes(chapterId) {
      this.$router.push(`/admin/quizzes/${chapterId}`);
    },

    goBack() {
      this.$router.go(-1);
    },
  },
  components: { ChapterCard },
};
