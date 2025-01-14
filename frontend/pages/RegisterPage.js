export default {
    template: `
    <div>
        <h1>Login</h1>
        <form @submit.prevent="submitLogin">
            <input type="text" placeholder="Username" v-model="email" />
            <input type="password" placeholder="Password" v-model="password" />
            <input type="role" placeholder="text" v-model="password" />
            <button type="submit">Login</button>
        </form>
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
                const response = await fetch(location.origin + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password }),
                });

                if (response.ok) {
                    console.log("You are logged in");
                    const data = await response.json();
                    console.log(data);
                } else {
                    console.log("Login failed. Status:", response.status);
                }
            } catch (error) {
                console.error("An error occurred:", error);
            }
        },
    },
};
