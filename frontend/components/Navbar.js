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
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/" class="nav-link" active-class="active">Home</router-link>
            </li>
            <!-- Show Login and Register if not logged in -->
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
            </li>
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/register" class="nav-link" active-class="active">Register</router-link>
            </li>
            <!-- Show User Home and Admin Dashboard if logged in -->
            <li class="nav-item" v-if="isLoggedIn && $store.state.role === 'user'">
              <router-link to="/user" class="nav-link" >User Home</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && $store.state.role === 'admin'">
              <router-link to="/admin-dashboard" class="nav-link" >Admin Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && $store.state.role === 'user'">
              <router-link to="/score-summary" class="nav-link" >Scores</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && $store.state.role === 'user'">
            <router-link to="/user" class="nav-link" >Summary</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && $store.state.role === 'admin'">
          <router-link to="/admin-dashboard" class="nav-link" >Quiz</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && $store.state.role === 'admin'">
          <router-link to="/admin-dashboard" class="nav-link" >Summary</router-link>
          </li> 
                 
            <!-- Show Logout if logged in -->
            <li class="nav-item" v-if="isLoggedIn">
              <button class="nav-link btn btn-link" @click="logout">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  computed: {
    // Computed property to check if the user is logged in
    isLoggedIn() {
      return this.$store.state.loggedIn;
    }
  },
  methods: {
    logout() {
      // Call the logout mutation
      this.$store.commit('logout');

      // Redirect to login page
      this.$router.push('/login');
    }
  }
};
