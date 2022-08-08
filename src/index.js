const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

const usersAPI = require("./datasources/users");
const venueAPI = require("./datasources/venue");

async function start() {
    const server = new ApolloServer({
        modules:[
          require('./services/users'),
          require('./services/venue')
        ],
        csrfPrevention: true,
        cache: "bounded",
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground()
        ],
        dataSources: () => {
          return {
            usersAPI: new usersAPI(),
            venueAPI: new venueAPI(),
          };
        },
      });
    const app = express();
  await server.start();
  server.applyMiddleware({ app });
  // parse req body as json
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/", (req, res) => {
    res.json({status:"OK",message:"Welcome to AICTE API Gateway!"});
  });
  app.listen({ port: 4000 }, () => {
    console.log(`Server up at http://localhost:${process.env.PORT || 4000}/graphql`);
  });
}
start()