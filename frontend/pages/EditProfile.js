export default {
  props : [ 'id'],
    template: `
      <div class="container mt-4">
        <h1 class="mb-4">Edit Profile</h1>
  
        <div v-if="user" class="card p-4 shadow-sm">
          <form @submit.prevent="updateProfile">
            <label for="full_name">Full Name</label>
            <input type="text" class="form-control" id="full_name" v-model="user.full_name">
  
            <label for="email">Email</label>
            <input type="email" class="form-control" id="email" v-model="user.email">
  
            <label for="qualification">Qualification</label>
            <input type="text" class="form-control" id="qualification" v-model="user.qualification">
  
            <label for="dob">Date of Birth</label>
            <input type="date" class="form-control" id="dob" v-model="user.dob">
  
            <label for="password">Password</label>
            <input type="password" class="form-control" id="password" v-model="password">
  
            <label for="confirm_password">Confirm Password</label>
            <input type="password" class="form-control" id="confirm_password" v-model="confirm_password">
  
            <button class="btn btn-primary mt-3" type="submit">Update Profile</button>
          </form>
        </div>
  
        <div v-else class="alert alert-danger">Failed to load account details.</div>
      </div>
    `,
  
    data() {
      return {
        user: null,
        password: "",
        confirm_password: "",
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
      } catch (error) {
        console.error(error.message);
      }
    },
  
    methods: {
      async updateProfile() {
        try {
          const updatedData = {};
      
          // Only add fields that have been changed (ignore empty values)
          const allowedFields = ['email', 'full_name', 'qualification', 'dob'];
          for (const key of allowedFields) {
            if (this.user[key] !== "" && this.user[key] !== null) {
              updatedData[key] = this.user[key];
            }
          }
      
          // Handle password update separately
          if (this.password !== "" && this.password === this.confirm_password) {
            updatedData.password = this.password; // Send plaintext password
            updatedData.confirm_password = this.confirm_password; // Send confirm_password
          } else if (this.password !== "" || this.confirm_password !== "") {
            alert("Passwords do not match!");
            return;
          }
      
          console.log("Sending payload:", updatedData); // Debugging line
      
          const response = await fetch(`${location.origin}/api/account/${this.$store.state.user_id}`, {
            method: "PUT",
            headers: {
              "Authorization-Token": this.$store.state.auth_token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          });
      
          if (!response.ok) {
            throw new Error("Failed to update profile");
          }
      
          alert("Profile updated successfully!");
          this.$router.push("/account"); // Redirect to account page after update
        } catch (error) {
          console.error(error.message);
        }
      }
    },
  };
  