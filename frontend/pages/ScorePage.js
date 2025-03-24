// Simulating the "Vue.js" Component in Plain JavaScript
export default {
    template: `
      <div class="container my-4">
        <h2>Your Quiz Scores</h2>
  
        <!-- Loading Message -->
        <div id="loading" class="text-center">
          <p>Loading scores...</p>
        </div>
  
        <!-- No Scores Message -->
        <div id="noScores" class="text-center" style="display: none;">
          <p>You haven't completed any quizzes yet.</p>
        </div>
  
        <!-- Scores Table -->
        <table id="scoresTable" class="table table-striped" style="display: none;">
          <thead>
            <tr>
              <th>#</th>
              <th>Quiz Name</th>
              <th>Your Score</th>
              <th>Date Completed</th>
            </tr>
          </thead>
          <tbody>
            <!-- Scores will be dynamically inserted here -->
          </tbody>
        </table>

  
        <div id="error" class="text-center" style="display: none;">
          <p>Failed to load scores. Please try again later.</p>
        </div>
      </div>
      <div>
      <button @click="create_csv" class="btn btn-primary">Download CSV</button>
    </div>
  </div>
    `,
    data() {
        return {
          scores: [], 
          userId: sessionStorage.getItem('id'),  // Assuming user ID is stored in sessionStorage
          authToken: sessionStorage.getItem('authToken'),  // Get the token too

        };
      },
      
    computed: {
      // You can add computed properties here, if needed
      formattedDate() {
        return function(date) {
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          const formattedDate = new Date(date).toLocaleDateString("en-US", options);
          return formattedDate;
        }
      },
    },
    async mounted() {
        try {
          // Show loading message while fetching
          document.getElementById("loading").style.display = "block";
          
          const response = await fetch(`${location.origin}/api/scores/${this.userId}`, {
            method: "GET",
            headers: {
              "Authorization-Token": this.authToken,
            },
          });
      
          // Log the response to check its contents
          console.log("API Response:", response);
      
          if (!response.ok) {
            throw new Error(`Failed to fetch scores. Status: ${response.status}`);
          }
      
          // Parse the response
          const scores = await response.json();
          console.log("Scores Data:", scores);  // Log the score data here
      
          if (scores.length === 0) {
            document.getElementById("noScores").style.display = "block";
          } else {
            this.scores = scores;
            this.displayScores();
          }
        } catch (error) {
          document.getElementById("error").style.display = "block";
          console.error("Error fetching scores:", error);
          document.getElementById("error").innerHTML = error.message;
        }
        console.log("User ID:", this.id);
      },
      
      
    methods: {
      // This method populates the scores table dynamically
      displayScores() {
        const tableBody = document.querySelector("#scoresTable tbody");
  
        this.scores.forEach((score, index) => {
          const row = document.createElement("tr");
  
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.quiz_name}</td>
            <td>${score.total_score} / ${score.max_score}</td>
            <td>${this.formattedDate()(score.date_completed)}</td>
          `;
  
          tableBody.appendChild(row);
        });
  
        // Show the table once data is populated
        document.getElementById("scoresTable").style.display = "block";
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
  };
  