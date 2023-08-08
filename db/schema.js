const { gql } = require("apollo-server");
// Schema
const typeDefs = gql`
  type User {
    id: ID
    name: String
    lastName: String
    email: String
    created: String
  }
  type Token {
    token: String
  }

  type Product {
    id: ID
    name: String
    exist: Int
    price: Float
    created: String
  }
  type Client {
    id: ID
    name: String
    lastName: String
    telephone: String
    email: String
    business: String
    seller: ID
  }
  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }
  input autenticateInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    exist: Int!
    price: Float!
  }

  input ClientInput {
    name: String!
    lastName: String!
    business: String!
    email: String!
    telephone: String
  }
  type Query {
    # User
    getUser(token: String!): User

    # Products
    getProducts: [Product]

    getProduct(id: ID!): Product

    # Client
    getClients: [Client]
    getClientsSeller: [Client]
    getClient(id: ID!): Client
  }
  type Mutation {
    # User
    newUser(input: UserInput): User
    authenticateUser(input: autenticateInput): Token

    # Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    # Cliente
    newClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id: ID!): String
  }
`;

module.exports = typeDefs;
