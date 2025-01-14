const Home = {
    template: `
    <div>
      <h1>Home</h1>
    </div>
    `
}
import LoginPage from '../pages/LoginPage.js';

const routes = [
    {path : '/', component: Home},
    {path : '/login', component: LoginPage},
    {path : '/register', component: Home},

]

const router = new VueRouter({
    routes
})

export default router