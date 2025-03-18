export default {
    template: `
    <div class="home-page">
        <!-- Banner Section -->
        <div class="banner-section d-flex align-items-center">
            <div class="banner-content text-start ms-5">
                <h1 class="display-4 fw-bold">Welcome to QuizMaster</h1>
                <p class="lead">Test your knowledge, challenge your friends, and have fun!</p>
                <div v-if="role === 'admin'">
                    <router-link to="/admin-dashboard" class="btn btn-primary btn-lg mt-3 align-items-center">Admin Dashboard</router-link>
                </div>
                <div v-if="role === 'user'">
                    <router-link to="/user" class="btn btn-primary btn-lg mt-3 align-items-center">Start Quiz</router-link>
                </div>
                <div v-if="role === 'guest'">
                    <router-link to="/login" class="btn btn-primary btn-lg mt-3 align-items-center">Start Quiz</router-link>
                </div>
            </div>

            <div class="banner-image flex-grow-1">
                <img src="/uploads/subjects/mainbanner.jpg" alt="Quiz App Banner" class="img-fluid" />
            </div>
        </div>

        <!-- Features Section -->
        <div class="features-section py-5 bg-light">
    <div class="container">
        <h2 class="text-center mb-5 fw-bold">Why Choose QuizMaster?</h2>
        <div class="row">
            <div class="col-md-4 text-center">
                <div class="feature-card p-4 rounded shadow-sm" style="background-color:rgb(161, 141, 255);">
                    <i class="fas fa-brain fa-3x text-primary mb-3"></i>
                    <h4 class="fw-bold">Interactive Quizzes</h4>
                    <p class="text-muted">Engage with a variety of quizzes on different topics.</p>
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="feature-card p-4 rounded shadow-sm" style="background-color: rgb(255, 86, 213);">
                    <i class="fas fa-trophy fa-3x text-primary mb-3"></i>
                    <h4 class="fw-bold">Compete & Win</h4>
                    <p class="text-muted">Challenge your friends and climb the leaderboard.</p>
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="feature-card p-4 rounded shadow-sm" style="background-color: rgb(76, 243, 255);">
                    <i class="fas fa-chart-line fa-3x text-primary mb-3"></i>
                    <h4 class="fw-bold">Track Progress</h4>
                    <p class="text-muted">Monitor your performance and improve over time.</p>
                </div>
            </div>
        </div>
    </div>
</div>

    </div>
    `,
    computed: {
        role() {
            return this.$store.state.role || 'guest';
        }
    }
};
