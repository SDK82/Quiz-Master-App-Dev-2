export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container">
        <!-- Brand name/logo -->
        <router-link to="/" class="navbar-brand">Quiz App</router-link>
        
        <!-- Toggler for mobile view -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Navbar links -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link" exact-active-class="active">Home</router-link>
            </li>
            <!-- Show Login and Register if not logged in -->
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/login" class="nav-link" exact-active-class="active">Login</router-link>
            </li>
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/register" class="nav-link" exact-active-class="active">Register</router-link>
            </li>
            <!-- Show User Home and Admin Dashboard if logged in -->
            <li class="nav-item" v-if="isLoggedIn && role === 'user'">
              <router-link to="/user" class="nav-link" exact-active-class="active">Subjects</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && role === 'admin'">
              <router-link to="/admin-dashboard" class="nav-link" exact-active-class="active">Admin Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && role === 'user'">
              <router-link to="/score-summary" class="nav-link" exact-active-class="active">Scores</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && role === 'user'">
              <router-link to="/user-summary" class="nav-link" exact-active-class="active">Summary</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && role === 'admin'">
              <router-link to="/quiz-management" class="nav-link" exact-active-class="active">Quiz</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && role === 'admin'">
              <router-link to="/admin-summary" class="nav-link" exact-active-class="active">Summary</router-link>
            </li> 
            <li class="nav-item" v-if="isLoggedIn">
              <button class="nav-link btn btn-link" @click="logout">Logout</button>
            </li>
          </ul>

          <!-- Right side of the Navbar -->
          <ul class="navbar-nav ms-auto" v-if="isLoggedIn">
            <li class="nav-item d-flex align-items-center">
              <router-link to="/account" class="nav-link text-white fw-bold text-decoration-none">
                <span class="me-2" style="font-size: 1.5rem;">👤</span> {{ name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,

  computed: {
    isLoggedIn() {
      return this.$store.state.loggedIn;
    },
    role() {
      return this.$store.state.role;
    },
    name() {
      return this.$store.state.full_name;
    }
  },

  methods: {
    logout() {
      this.$store.commit('logout');
      this.$router.push('/login');
    }
  }
};
