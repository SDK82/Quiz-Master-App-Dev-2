export default {
  template: `
  <div class="container">
    <div>
        <h1>Login</h1>
        <p>Enter your email and password to log in.</p>
        <form>
  <div @submit.prevent="submitLogin" class="mb-3">
    <label for="exampleInputEmail1" class="form-label">Email address</label>
    <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" v-model="email">
    <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
  </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Password</label>
    <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
  </div>

  <button @click="submitLogin" class="btn btn-primary">Login</button>
  
</form>
    </div>
    </div>
    `,
  data() {
    return {
      email: null,
      password: null,
    };
  },
  methods: {
    async submitLogin() {
      try {
        const response = await fetch(location.origin + "/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        if (response.ok) {
          console.log("You are logged in");
          const data = await response.json();
          console.log(data);
          localStorage.setItem("user", JSON.stringify(data));
          this.$store.commit("setuser");
          this.$router.push("/user");

        } else {
          console.log("Login failed. Status:", response.status);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    },
  },
};
