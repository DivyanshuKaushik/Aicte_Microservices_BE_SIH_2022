const { gql, UserInputError } = require("apollo-server-express");
const {isAuthenticated} = require("../validators/auth");
const typeDefs = gql`
    type Chat{
        _id: ID!
        from_user: ID!
        to_user: ID!
        by_user: ID!
        message: String!
        createdAt: String!
        updatedAt: String!
    }

    type CommonChat{
        _id: ID!
        user_id: ID!
        user_name: String!
        user_email: String!
        message: String!
        createdAt: String!
        updatedAt: String!
    }
    type Inbox{
        _id: ID!
        user1: ID!
        user2: ID!
        user1_name: String!
        user2_name: String!
        lastmessage: String!
        createdAt: String!
        updatedAt: String!
    }
    
    extend type Query {
        getMessages(seconduser: ID!): [Chat]
        getCommonMessages: [CommonChat]
        getInbox:[Inbox]!
    }
    extend type Mutation{
        sendMessage(to:ID!,message:String!,to_name:String!): String!
        sendCommonMessage(message:String!): String!
    }
`
const resolvers = {
    Query: {
        getMessages: async(_, args, { dataSources, req }, info) => {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.chatAPI.getMessages(args.seconduser)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        getCommonMessages: async(_, args, { dataSources, req }, info) => {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.chatAPI.getCommonMessages()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        getInbox: async(_, args, { dataSources, req }, info) => {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.chatAPI.getInbox()).data;
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation:{
        async sendMessage(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.chatAPI.sendMessage(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async sendCommonMessage(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.chatAPI.sendCommonMessage(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        }
    }
}
module.exports = {typeDefs, resolvers};