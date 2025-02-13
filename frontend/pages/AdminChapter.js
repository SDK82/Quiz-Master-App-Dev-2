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
                    <div class="card-footer bg-white border-0 text-center display: flex;">
                        <button class="btn btn-outline-primary ">View Quizzes</button>
                        <button class="btn btn-outline-danger " @click.stop="deleteChapter(chapter.id)">Delete</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="text-center mt-5">
        <button class="btn btn-primary" @click="showAddChapterModal = true">Add Chapter</button>
    </div>
    <div v-if="showAddChapterModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                <h3 class="mb-3">Add New Chapter</h3>
                <form @submit.prevent="addChapter">
                    <div class="mb-3">
                        <label for="subjectName" class="form-label">Chapter Name</label>
                        <input v-model="newChapter.name" type="text" id="subjectName" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="subjectDescription" class="form-label">Description</label>
                        <textarea v-model="newChapter.description" id="subjectDescription" class="form-control" required></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-secondary me-2" @click="showAddChapterModal = false">Cancel</button>
                        <button type="submit" class="btn btn-success">Add Chapter</button>
                    </div>
                </form>
            </div>
        </div>
        </div>

        <div v-else class="text-center mt-5">
            <p class="lead text-muted">No chapters found for this subject.</p>
            <div class="text-center mt-5">
                <button class="btn btn-primary" @click="showAddChapterModal = true">Add Chapter</button>
            </div>
        
            <div v-if="showAddChapterModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999;">
                <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                    <h3 class="mb-3">Add New Chapter</h3>
                        <form @submit.prevent="addChapter">
                            <div class="mb-3">
                                <label for="subjectName" class="form-label">Chapter Name</label>
                                <input v-model="newChapter.name" type="text" id="subjectName" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="subjectDescription" class="form-label">Description</label>
                                <textarea v-model="newChapter.description" id="subjectDescription" class="form-control" required></textarea>
                            </div>
                            <div class="d-flex justify-content-end">
                                <button type="button" class="btn btn-secondary me-2" @click="showAddChapterModal = false">Cancel</button>
                                <button type="submit" class="btn btn-success">Add Chapter</button>
                            </div>
                        </form>
                </div>
            </div>
       
        <div class="text-center mt-5">
            <button class="btn btn-primary" @click="goBack">Go Back</button>
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
    goToQuizzes(chapterId) {
      this.$router.push(`/admin/quizzes/${chapterId}`);
    },
    goBack() {
      this.$router.go(-1);
    },
    async addChapter() {
        try {
            console.log(this.$route.params.subjectId)
            // Ensure subject_id is set
            this.newChapter.subject_id = this.$route.params.subjectId;
    
            // Check if the chapter name already exists (before sending request)
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
    
            const newChapterFromServer = await response.json(); // Get the newly created chapter from API response
    
            // Hide modal & reset form
            this.showAddChapterModal = false;
            this.newChapter = { name: '', description: '', subject_id: '' };
    
            // 🔥 **Update UI instantly**
            this.chapters.push(newChapterFromServer); 
            await this.fetchChapters(); // Refresh chapter list after deletion

    
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

            await this.fetchChapters(); // Refresh chapter list after deletion
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