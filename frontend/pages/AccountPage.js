export default {
    template: `
      <div class="container mt-4">
        <h1 class="mb-4">Account Details</h1>
  
        <div v-if="user" class="card p-4 shadow-sm">
            <h3><strong>Name:</strong> {{ user.full_name }}</h3>
            <p><strong>ID:</strong> {{ user.id }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Qualification:</strong> {{ user.qualification }}</p>
          <p><strong>Date of Birth:</strong> {{ user.dob }}</p>
          <p><strong>Created At:</strong> {{ user.created_at }}</p>
  
          <button class="btn btn-primary mt-3" @click="editProfile">Edit Profile</button>
        </div>
  
        <div v-else class="alert alert-danger">Failed to load account details.</div>
      </div>
    `,
  
    data() {
      return {
        user: null,
      };
    },
  
    async mounted() {
      try {
        const response = await fetch(`${location.origin}/api/account/${this.$store.state.user_id}`, {
          headers: {
            "Authorization-Token": this.$store.state.auth_token,
          },
        });
  
        if (!response.ok) throw new Error("Failed to fetch user details");
  
        this.user = await response.json();
        console.log(this.user);
      } catch (error) {
        console.error(error.message);
      }
    },
  
    methods: {
      editProfile() {
        this.$router.push("/edit-profile");
      },
    },
  };
  