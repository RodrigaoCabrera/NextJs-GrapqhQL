const User = require("../models/User");
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
    getUser: async (_, { token }) => {
      const userId = await jwt.verify(token, process.env.SECRET);

      return userId;
    },
  },
  Mutation: {
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
  },
};

module.exports = resolvers;
