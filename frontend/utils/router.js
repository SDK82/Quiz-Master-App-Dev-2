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


const routes = [
    {path : '/', component: Home},
    {path : '/login', component: LoginPage},
    {path : '/register', component: RegisterPage},
    {path : '/user', component: UserHome},
    { path: "/subject/:subjectId/chapters", component: ChaptersPage },
    { path: "/chapter/:chapterId/quizzes", component: QuizPage, props: true },
]

const router = new VueRouter({
    routes
})

export default router