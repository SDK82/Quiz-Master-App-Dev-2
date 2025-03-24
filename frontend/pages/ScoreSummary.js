export default {
  template: `
    <div class="score-summary-container">
      <div class="container">
        <div class="header">
          <h1 class="page-title">📊 Score Summary</h1>
          <p class="page-subtitle">Your quiz performance at a glance</p>
          <div>
          <button @click="create_csv" class="btn btn-primary">Download CSV</button>
        </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover table-bordered">
            <thead class="table-header">
              <tr>
                <th scope="col">📚 Subject</th>
                <th scope="col">📖 Chapter</th>
                <th scope="col">⏰ Quiz Attempted Time</th>
                <th scope="col">🎯 Score</th>
                <th scope="col">⏱️ Time Taken</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="score in scores" :key="score.id" class="table-row">
                <td>{{ score.subject_name }}</td>
                <td>{{ score.chapter_name }}</td>
                <td>{{ score.timestamp }}</td>
                <td>{{ score.total_score }}/{{score.max_score}}</td>
                <td>{{ formatTime(score.time_taken) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

</div>
  `,

  data() {
    return {
      scores: [], // Holds the list of scores fetched from the API
    };
  },

  methods: {
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} min ${remainingSeconds} sec`;
    },
    async create_csv() {
      try {
        const response = await fetch(`${location.origin}/create_csv`);
        if (!response.ok) throw new Error("Failed to create CSV");
    
        const taskData = await response.json();
        const task_id = taskData.task_id;
    
        const interval = setInterval(async () => {
          try {
            const res = await fetch(`${location.origin}/download_csv/${task_id}`);
            if (res.ok) {
              clearInterval(interval);
              console.log("Downloaded");
              window.open(`${location.origin}/download_csv/${task_id}`);
            }
          } catch (error) {
            console.error("Error downloading CSV:", error);
          }
        }, 1000);
      } catch (error) {
        console.error("Error creating CSV:", error);
      }
    }
  },

  async mounted() {
    // Ensure Vuex state is updated
    this.$store.commit('setuser');

    // Fetch user_id from Vuex state
    const user_id = this.$store.state.user_id;
    console.log("User ID:", user_id);

    // Redirect to login if user_id is missing
    if (!user_id) {
      console.error("User ID is missing. Redirecting to login...");
      this.$router.push("/login");
      return;
    }

    try {
      // Fetch scores from the API
      const response = await fetch(`${location.origin}/api/scores/${user_id}`, {
        headers: {
          "Authorization-Token": this.$store.state.auth_token,
        },
      });

      // Handle response
      if (response.ok) {
        this.scores = await response.json();
      } else {
        throw new Error(`Failed to fetch scores. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  },
};
