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

  type Order {
    id: ID
    orders: [OrderGroup]
    total: Float
    client: ID
    seller: ID
    date: String
    state: OrderState
  }
  type OrderGroup {
    id: ID
    quantity: Int
  }

  type TopClients {
    total: Float
    client: [Client]
  }
  type TopSellers {
    total: Float
    seller: [User]
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

  input orderProductInput {
    id: ID
    quantity: Int
  }
  input OrderInput {
    orders: [orderProductInput]
    total: Float
    client: ID
    state: OrderState
  }
  enum OrderState {
    PENDING
    COMPLETED
    CANCELED
  }
  type Query {
    # User
    getUser: User

    # Products
    getProducts: [Product]

    getProduct(id: ID!): Product

    # Client
    getClients: [Client]
    getClientsSeller: [Client]
    getClient(id: ID!): Client

    # Orders
    getOrders: [Order]
    getOrdersSeller: [Order]
    getOrder(id: ID!): Order
    getOrdersByState(state: String!): [Order]

    # Busquedas avanzadas
    bestClients: [TopClients]
    bestSellers: [TopSellers]
    searchProduct(text: String!): [Product]
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

    # Order
    newOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }
`;

module.exports = typeDefs;
