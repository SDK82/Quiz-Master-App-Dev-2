export default {
    props: ['name', 'description', 'id'],
    template: `
    <div class="jumbotron" @click="$emit('click')">
        <h2>Name : {{name}}</h2>
        <hr>
        <p>Description : {{description}}</p>
        <p>Id : {{id}}</p>

    </div>
    `,
    
    
    
}

