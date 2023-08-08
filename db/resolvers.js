const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
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
      console.log(ctx);
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
  },
};

module.exports = resolvers;
