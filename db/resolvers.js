const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Orders = require("../models/Orders");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });

const createToken = (user, secret, expiresIn) => {
  const { id, email, name, lasName } = user;
  return jwt.sign({ id }, secret, { expiresIn });
};
// Resolvers
const resolvers = {
  Query: {
    // Users
    getUser: async (_, { token }) => {
      const userId = await jwt.verify(token, process.env.SECRET);

      return userId;
    },

    // Products
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },

    getProduct: async (_, { id }) => {
      // Revisar si existe el product
      const product = await Product.findById(id);

      if (!product) {
        throw new Error("El producto no existe");
      }

      return product;
    },

    /*  Cliente  */
    getClients: async () => {
      try {
        const clients = await Client.find({});
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClientsSeller: async (_, {}, ctx) => {
      try {
        const clients = await Client.find({ seller: ctx.user.id.toString() });
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClient: async (_, { id }, ctx) => {
      // Revisar si existe el client
      const client = await Client.findById(id);
      if (!client) {
        throw new Error("El cliente no existe");
      }

      // Quien lo creo puede verlo
      if (client.seller.toString() !== ctx.user.id) {
        throw new Error("No tienes las credenciales");
      }

      return client;
    },
  },
  Mutation: {
    /* Users */
    newUser: async (_, { input }) => {
      const { email, password } = input;
      // Revisar si el user está registrado
      const isUser = await User.findOne({ email });
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);
      if (isUser) {
        throw new Error("El user ya está registrado");
      }
      // Hashear su password
      //Guardar en DB
      try {
        const user = new User(input);
        user.save(); //Guardar en DB
        return user;
      } catch (err) {
        console.log(err);
      }
    },

    authenticateUser: async (_, { input }) => {
      const { email, password } = input;
      //Si el usuario existe

      const isUser = await User.findOne({ email });
      if (!isUser) {
        throw new Error("El user no existe");
      }

      //Revisar si el user es correcto
      const passwordCorrect = await bcryptjs.compare(password, isUser.password);

      if (!passwordCorrect) {
        throw new Error("El password es incorrecto");
      }

      //Crear token
      return {
        token: createToken(isUser, process.env.SECRET, "24h"),
      };
    },

    /* Products */
    newProduct: async (_, { input }) => {
      try {
        const product = new Product(input);

        // Almacenar en bd
        const result = await product.save();
        return result;
      } catch (error) {
        console.log(error);
      }
    },

    updateProduct: async (_, { id, input }) => {
      // Revisar si existe el product
      let product = await Product.findById(id);

      if (!product) {
        throw new Error("El producto no existe");
      }

      //Guardar en bd
      product = await Product.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return product;
    },

    deleteProduct: async (_, { id }) => {
      // Revisar si existe el product
      let product = await Product.findById(id);

      if (!product) {
        throw new Error("El producto no existe");
      }

      // ELiminamos product
      Product.findOneAndRemove({ _id: id });

      return "Producto eliminado";
    },

    /* Client */
    newClient: async (_, { input }, ctx) => {
      // verifcar si el cliente está registrado
      const { email } = input;
      const client = await Client.findOne({ email });

      if (client) {
        throw new Error("El cliente ya está registrado");
      }

      const newClient = await new Client(input);
      // asignar el vendedor
      newClient.seller = ctx.user.id;
      // Guardar en bd
      try {
        const result = await newClient.save();
        return result;
      } catch (error) {
        console.log(error);
      }
    },

    updateClient: async (_, { id, input }, ctx) => {
      // verifcar si el client existe
      let client = await Client.findById(id);
      if (!client) {
        throw new Error("El cliente no existe");
      }
      // Verificar si el vendedor edita su propio cliente
      if (client.seller.toString() !== ctx.user.id) {
        throw new Error("No tienes las credenciales");
      }

      // Guardar cliente
      client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });

      return client;
    },

    deleteClient: async (_, { id }, ctx) => {
      // verifcar si el client existe
      let client = await Client.findById(id);
      if (!client) {
        throw new Error("El cliente no existe");
      }
      // Verificar si el vendedor edita su propio cliente
      if (client.seller.toString() !== ctx.user.id) {
        throw new Error("No tienes las credenciales");
      }

      // Guardar cliente
      client = await Client.findOneAndRemove({ _id: id });

      return "client eliminado";
    },

    /* Orders */
    newOrder: async (_, { input }, ctx) => {
      const { client } = input;
      // verifcar si el client existe
      let isCLient = await Client.findById(client);
      if (!isCLient) {
        throw new Error("El cliente no existe");
      }
      // Verificar si el cliente es del seller
      if (isCLient.seller.toString() !== ctx.user.id) {
        throw new Error("No tienes las credenciales");
      }
      //Revisar que el stock esté disponible
      for await (const order of input.orders) {
        const { id, quantity } = order;
        const product = await Product.findById(id);

        if (quantity > product.exist) {
          throw new Error(
            `El pedido sobre el producto: ${product.name} excede la cantidad de sock`
          );
        } else {
          // Restar la cantida de stock
          product.exist = product.exist - order.quantity;
          await product.save();
        }
      }
      // Crear nuevo pedido
      const newOrders = new Orders(input);
      // Asignar un seller
      newOrders.seller = ctx.user.id;
      // Guardar en bd
      const result = await newOrders.save();
      return result;
    },
  },
};

module.exports = resolvers;
