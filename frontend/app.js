import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js"
import Footer from "./components/Footer.js"

const app = new Vue({
    el: '#app', //mount with the id of app
    template: `
        <div id="app" class="d-flex flex-column min-vh-100"> 
            <Navbar/>
            <div class="flex-grow-1">
                <router-view></router-view>
            </div>
            <Footer v-if="!$route.meta.hideFooter"/> 
        </div>

        `,
    components: {
        Navbar,
        Footer
    },
    router,
    store,
    
})
