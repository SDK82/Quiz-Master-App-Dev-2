const store = new Vuex.Store({
    state: {
        // State properties
        auth_token: null,
        role: null,
        loggedIn: false,
        user_id: null,
        full_name: null,
    },
    mutations: {
        // Mutations to change the state
        setuser(state) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.token && user.role && user.id && user.full_name) {
                    state.auth_token = user.token;
                    state.role = user.role;
                    state.loggedIn = true;
                    state.user_id = user.id;
                    state.full_name = user.full_name;
                } else {
                    console.warn('Invalid or incomplete user data in localStorage');
                }
            } catch (error) {
                console.warn('Error parsing user data from localStorage:', error);
            }
        },
        logout(state) {
            state.auth_token = null;
            state.role = null;
            state.loggedIn = false;
            state.user_id = null;
            state.full_name = null;
            localStorage.removeItem('user');
        },
    },
    actions: {
        // Actions to commit mutations (can be async)
        login({ commit }, userData) {
            // Simulate a login action (replace with actual API call)
            localStorage.setItem('user', JSON.stringify(userData));
            commit('setuser');
        },
        logout({ commit }) {
            commit('logout');
        },
    },
    getters: {
        // Getters to access state properties
        isLoggedIn: (state) => state.loggedIn,
        authToken: (state) => state.auth_token,
        userRole: (state) => state.role,
        userId: (state) => state.user_id,
        userName: (state) => state.full_name,
    },
});
store.commit('setuser');
// Export the store
export default store;