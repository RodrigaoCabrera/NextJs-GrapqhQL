const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const conectDB = require("./config/db");
// Conectar a la BD
conectDB();
// servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    //console.log(req.headers['authorization'])
    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET);
        return {
          user,
        };
      } catch (error) {
        console.log("Hubo un error: ", error);
      }
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`);
});
