const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

const authAPI = require("./datasources/auth");
const chatAPI = require("./datasources/chat");

async function start() {
    const server = new ApolloServer({
        modules:[
          require('./services/auth'),
        ],
        csrfPrevention: true,
        cache: "bounded",
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground()
        ],
        dataSources: () => {
          return {
            authAPI: new authAPI(),
            chatAPI: new chatAPI()
          };
        },
      });
    const app = express();
  await server.start();
  server.applyMiddleware({ app });
  // parse req body as json
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.listen({ port: 4000 }, () => {
    console.log(`Server up at http://localhost:${process.env.PORT || 4000}/graphql`);
  });
}
start()