const Home = {
    template: `
    <div>
      <h1>Home</h1>
    </div>
    `
}
import LoginPage from '../pages/LoginPage.js';
import RegisterPage from '../pages/RegisterPage.js';
import UserHome from '../pages/UserHome.js';

const routes = [
    {path : '/', component: Home},
    {path : '/login', component: LoginPage},
    {path : '/register', component: RegisterPage},
    {path : '/user', component: UserHome},
    {path : '/subjects/:id', component: SubjectDisplayPage , props: true},

]

const router = new VueRouter({
    routes
})

export default router