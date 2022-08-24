const { gql, UserInputError } = require("apollo-server-express");
const {isAuthenticated} = require("../validators/auth");
const typeDefs = gql`
    type Event{
        id: ID
        name: String
        description: String
        caption: String
        image:String
        status: String
        from_date: String
        to_date: String
        time: String
        organiser: ID
        food_req: String
        expected_count:String
        createdat: String
        updatedat: String
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
    type Task{
        id: ID!
        user_id: ID
        event_id: ID
        user_name:String
        user_email:String
        task: String
        createdat:String
    }
    input TaskInput{
        id: ID!
        name:String!
        email:String!
        task: String!
    }
    type TaskForUser{
        event:Event 
        task:String
    }
    type Feedback{
        id: ID
        event_id: ID
        user_id: ID
        user_name:String
        user_email:String
        overall: String
        venue: String
        coordination: String
        canteen: String
        suggestion: String
        createdat:String
    }
    extend type Query {
        getEvents: [Event]
        getEvent(id: ID!): Event
        getInvites(event_id: ID!): [Invite]
        getInvitedEvents(user_id: ID!): [Event]
        getTasksByEvent(event_id:ID!):[Task]
        getTasksByUser(user_id:ID!) : [TaskForUser]
        getFeedbacks(event_id:ID!):[Feedback]
    }
    extend type Mutation{
    createEvent(name:String!,description:String!,organiser:String!,food_req:String!,expected_count:String!,caption:String!,status:String!,from_date:String!,to_date:String!,time:String!,image:String!): Event
    updateEvent(id:ID!,name:String!,description:String!,,organiser:String!caption:String!,status:String!,from_date:String!,to_date:String!,time:String!,image:String!): String! 
    deleteEvent(id:ID!): String! 
    inviteUsers(event_id:ID!,departments:[String],users:[InviteUser]): String!
    assignTasks(event_id:ID!,tasks:[TaskInput]): String!
    updateEventStatus(id:ID!,status:String!):String!
    submitFeedback(user_id:ID!,user_name:String!,user_email:String!,event_id:ID!,overall:String!,venue:String!,coordination:String!,canteen:String!,suggestion:String!):String!
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
                throw new Error(error);
            }
        },
        async getInvites(_, args, { dataSources, req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getInvites(args.event_id)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getInvitedEvents(_, args, { dataSources, req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getInvitedEvents(args.user_id)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getTasksByEvent(_, args, { dataSources, req }, info){
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getTasksByEvent(args.event_id)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getTasksByUser(_, args, { dataSources, req }, info){
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getTasksByUser(args.user_id)).data;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
        },
        async getFeedbacks(_, args, { dataSources, req }, info){
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.getFeedbacks(args.event_id)).data;
            } catch (error) {
                throw new Error(error);
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
        async updateEventStatus(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.updateEventStatus(args)).data;
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
        },
        async assignTasks(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.assignTasks(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async submitFeedback(_,args,{dataSources,req},info){
           try{
                req.user = await isAuthenticated(req)
                return (await dataSources.eventsAPI.submitFeedback(args)).data;
            }catch(err){
            throw new Error(err)
           }
        }
    }
}
module.exports = {typeDefs, resolvers};