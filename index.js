const { ApolloServer } = require("apollo-server");
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')

const conectDB = require('./config/db')
// Conectar a la BD
conectDB()
// servidor
const server = new ApolloServer({
    typeDefs,
    resolvers
});


server.listen().then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`);
});
