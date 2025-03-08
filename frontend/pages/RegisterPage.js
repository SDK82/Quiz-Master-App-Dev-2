export default {
    template: `
    <div class="container mt-4">
        <h1 class="mb-4 text-center">Register</h1>
        <form @submit.prevent="submitRegistration">
            <div class="mb-3">
                <label for="fullName" class="form-label">Full Name</label>
                <input 
                    type="text" 
                    class="form-control" 
                    id="fullName" 
                    v-model="full_name" 
                    placeholder="Enter your full name" 
                    required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="email" 
                    placeholder="Enter your email address" 
                    required>
                <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="password" 
                    placeholder="Enter a strong password" 
                    required>
            </div>
            <div class="mb-3">
                <label for="qualification" class="form-label">Qualification</label>
                <input 
                    type="text" 
                    class="form-control" 
                    id="qualification" 
                    v-model="qualification" 
                    placeholder="Enter your qualification">
            </div>
            <div class="mb-3">
                <label for="dob" class="form-label">Date of Birth</label>
                <input 
                    type="date" 
                    class="form-control" 
                    id="dob" 
                    v-model="dob">
            </div>
            <div class="d-grid mt-4">
                <button type="submit" class="btn btn-primary btn-block">Register</button>
            </div>
        </form>
    </div>
    `,
    data() {
        return {
            full_name: null,
            email: null,
            password: null,
            qualification: null,
            dob: null,
            role: null,
        };
    },
    methods: {
        async submitRegistration() {
            try {
                const response = await fetch(location.origin + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: this.full_name,
                        email: this.email,
                        password: this.password,
                        qualification: this.qualification,
                        dob: this.dob,
                        role: 'user', // Default role as 'user'
                        
                    }),
                });

                if (response.ok) {
                    console.log("Registration successful");
                    const data = await response.json();
                    localStorage.setItem('user', JSON.stringify(data));
                    this.$router.push('/');
                    
                } else {
                    console.log("Registration failed. Status:", response.status);
                }
            } catch (error) {
                console.error("An error occurred:", error);
            }
        },
        resetForm() {
            this.full_name = '';
            this.email = '';
            this.password = '';
            this.qualification = '';
            this.dob = '';
        }
    },
};
