const express = require("express");
const http = require("http");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
// const {WebSocketServer} = require('ws')
// const {useServer} = require('graphql-ws/lib/use/ws')
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageLocalDefault
} = require("apollo-server-core");
const { PubSub } = require("graphql-subscriptions");
// data sources 
const usersAPI = require("./datasources/users");
const venueAPI = require("./datasources/venue");
const eventsAPI = require("./datasources/events");
const chatAPI = require("./datasources/chat");
const mailAPI = require("./datasources/mail");
const logsAPI = require("./datasources/logs");
const socialsAPI = require("./datasources/socials");

// pubsub instance for subscriptions 
const pubsub = new PubSub();


// const wsServer = new WebSocketServer({
//   server: httpServer,
//   path: '/graphql',
// });
// const serverCleanup = useServer({},wsServer);

// api gateway server 
async function start() {
  const server = new ApolloServer({
    modules:[
      require('./services/users'),
      require('./services/venue'),
      require('./services/events'),
      require('./services/chat'),
      require('./services/mail'),
      require('./services/logs'),
      require('./services/socials')
    ],
    csrfPrevention: true,
    cache: "bounded",
    context: ({ req, }) => ({ req,pubsub }),
    plugins: [
        // ApolloServerPluginLandingPageGraphQLPlayground(),
        ApolloServerPluginLandingPageLocalDefault()
      // {
      //   async serverWillStart() {
      //     return {
      //       async drainServer() {
      //         await serverCleanup.dispose();
      //       },
      //     };
      //   },
      // },
    ],
    dataSources: () => {
      return {
        usersAPI: new usersAPI(),
        venueAPI: new venueAPI(),
        eventsAPI: new eventsAPI(),
        chatAPI: new chatAPI(),
        mailAPI: new mailAPI(),
        logsAPI: new logsAPI(),
        socialsAPI: new socialsAPI(),
      };
    },
    // subscriptions: {
    //   onConnect: () => {
    //     console.log("connected to ws");
    //   }
    // },
  });
  await server.start();
  const app = express();
  server.applyMiddleware({ app });
  // const httpServer = http.createServer(app);
  // server.installSubscriptionHandlers(httpServer);  
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