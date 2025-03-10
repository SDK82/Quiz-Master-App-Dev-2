import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js"
import Footer from "./components/Footer.js"

const app = new Vue({
    el: '#app', //mount with the id of app
    template: `
        <div> 
            <Navbar/>
            <router-view></router-view>
            <Footer v-if="!$route.meta.hideFooter"/> <!-- Conditionally render the footer -->
        </div>

        `,
    components: {
        Navbar,
        Footer
    },
    router,
    store,
    
})
