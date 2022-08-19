const { gql, UserInputError } = require("apollo-server-express");
const {isAuthenticated} = require("../validators/auth");
const typeDefs = gql`
    type Event{
        id: ID!
        name: String!
        description: String!
        caption: String!
        image:String!
        status: String!
        from_date: String!
        to_date: String!
        time: String!
        organiser: ID!
        createdat: String!
        updatedat: String!
    }
    type Invite {
        id: ID!
        event_id: ID!
        user_id: ID!
        name: String!
        email: String!
        phone: String!
        createdat: String!
        updatedat: String!
    }
    input InviteUser {
        id: ID!
        name: String!
        email: String!
        phone: String!
    }
    extend type Query {
        getEvents: [Event]
        getEvent(id: ID!): Event
        getInvites(event_id: ID!): [Invite]
        getInvitedEvents(user_id: ID!): [Event]
    }
    extend type Mutation{
    createEvent(name:String!,description:String!,organiser:String!,caption:String!,status:String!,from_date:String!,to_date:String!,time:String!,image:String!): Event
    updateEvent(id:ID!,name:String!,description:String!,,organiser:String!caption:String!,status:String!,from_date:String!,to_date:String!,time:String!,image:String!): String! 
    deleteEvent(id:ID!): String! 
    inviteUsers(event_id:ID!,users:[InviteUser]): String!
  }
`
const resolvers = {
    Query: {
        getEvents: async(_, args, { dataSources, req }, info) => {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getEvents()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getEvent(_, args, { dataSources, req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getEvent(args.id)).data;
            } catch (error) {
                throw new Error(error.data);
            }
        },
        async getInvites(_, args, { dataSources, req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getInvites(args.event_id)).data;
            } catch (error) {
                throw new Error(error.data);
            }
        },
        async getInvitedEvents(_, args, { dataSources, req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getInvitedEvents(args.user_id)).data;
            } catch (error) {
                throw new Error(error.data);
            }
        }
    },
    Mutation:{
        async createEvent(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.registerEvent(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updateEvent(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.updateEvent(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async deleteEvent(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.deleteEvent(args.id)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async inviteUsers(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.inviteUsers(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        }
    }
}
module.exports = {typeDefs, resolvers};