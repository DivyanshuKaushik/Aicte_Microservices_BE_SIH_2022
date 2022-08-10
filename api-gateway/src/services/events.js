const { gql, UserInputError } = require("apollo-server-express");

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
    extend type Query {
        getEvents: [Event]
        getEvent(id: ID!): Event
    }
    extend type Mutation{
    createEvent(name:String!,description:String!,organiser:String!,caption:String!,status:String!,from_date:String!,to_date:String!,time:String!,image:String!): Event
    updateEvent(id:ID!,name:String!,description:String!,,organiser:String!caption:String!,status:String!,from_date:String!,to_date:String!,time:String!,image:String!): String! 
    deleteEvent(id:ID!): String! 
  }
`
const resolvers = {
    Query: {
        getEvents: async(_, args, { dataSources }, info) => {
            try {
                return (await dataSources.eventsAPI.getEvents()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getEvent(_, args, { dataSources }, info) {
            try {
                return (await dataSources.eventsAPI.getEvent(args.id)).data;
            } catch (error) {
                throw new Error(error.data);
            }
        }
    },
    Mutation:{
        async createEvent(_,args,{dataSources},info){
            try{
                return (await dataSources.eventsAPI.registerEvent(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updateEvent(_,args,{dataSources},info){
            try{
                return (await dataSources.eventsAPI.updateEvent(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async deleteEvent(_,args,{dataSources},info){
            try{
                return (await dataSources.eventsAPI.deleteEvent(args.id)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
    }
}
module.exports = {typeDefs, resolvers};