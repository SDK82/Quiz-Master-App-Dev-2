export default {
    props: ['name', 'description', 'id'],
    template: `
    <div class="jumbotron">
        <h2 @click="$router.push('/subjects/'+ id)">Name : {{name}}</h2>
        <hr>
        <p>Description : {{description}}</p>
        <p>Id : {{id}}</p>

    </div>
    `,
    
    
}