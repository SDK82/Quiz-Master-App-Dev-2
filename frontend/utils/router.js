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
import ChaptersPage from '../pages/ChaptersPage.js';
import QuizPage from '../pages/QuizPage.js';
import AdminDashboard from '../pages/AdminDashboard.js';

import store from './store.js';


const routes = [
    {path : '/', component: Home},
    {path : '/login', component: LoginPage},
    {path : '/register', component: RegisterPage},
    {path : '/user', component: UserHome, meta: {requiresLogin: true , role: 'user'}},
    { path: "/subject/:subjectId/chapters", component: ChaptersPage, meta: {requiresLogin: true} },
    { path: "/chapter/:chapterId/quizzes", component: QuizPage, props: true, meta: {requiresLogin: true}  },
    {path : "/admin-dashboard", component: AdminDashboard, meta: {requiresLogin: true, role: 'admin'}},
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)) {
        // Check if the user is logged in
        if (!store.state.loggedIn) {
            // Redirect to the login page
            next({ path: '/login' });
        } else if (to.meta.role && to.meta.role !== store.state.role) {
            // Redirect based on role mismatch
            if (store.state.role === 'admin') {
                next({ path: '/admin-dashboard' }); // Redirect admin to AdminDashboard
            } else if (store.state.role === 'user') {
                next({ path: '/user' }); // Redirect user to UserHome
            } else {
                next({ path: '/' }); // Redirect to default home page
            }
        } else {
            // Proceed to the route
            next();
        }
    } else {
        // No authentication required, proceed to the route
        next();
    }
});

// Handle default redirection after login
router.beforeEach((to, from, next) => {
    if (to.path === '/login' && store.state.loggedIn) {
        // Redirect logged-in users based on role
        if (store.state.role === 'admin') {
            next({ path: '/admin-dashboard' });
        } else if (store.state.role === 'user') {
            next({ path: '/user' });
        } else {
            next({ path: '/' });
        }
    } else {
        next(); // Proceed normally
    }
});



export default router