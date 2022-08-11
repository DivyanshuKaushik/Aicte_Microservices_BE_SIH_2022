const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

// data sources 
const usersAPI = require("./datasources/users");
const venueAPI = require("./datasources/venue");
const eventsAPI = require("./datasources/events");

// api gateway server 
async function start() {
  const server = new ApolloServer({
    modules:[
      require('./services/users'),
      require('./services/venue'),
      require('./services/events'),
    ],
    csrfPrevention: true,
    cache: "bounded",
    context: ({ req }) => ({ req }),
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground()
    ],
    dataSources: () => {
      return {
        usersAPI: new usersAPI(),
        venueAPI: new venueAPI(),
        eventsAPI: new eventsAPI(),
      };
    },
  });
  await server.start();
  const app = express();
  server.applyMiddleware({ app });

  // parse req body as json
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // cors config 
  app.use(cors({ origin: "*" }));

  // image upload route /upload
  app.use(require('./upload'))

  app.get("/", (req, res) => {
    res.json({status:"OK",message:"Welcome to AICTE API Gateway!"});
  });

  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(`Server up at http://localhost:${process.env.PORT || 4000}/graphql`);
  });
}
start()