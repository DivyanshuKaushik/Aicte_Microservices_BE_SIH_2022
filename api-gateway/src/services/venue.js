const { gql, UserInputError } = require("apollo-server-express");

const typeDefs = gql`
    type Venue{
        id: ID!
        name: String!
        email: String!
        phone: String!
        city: String!
        state: String!
        address: String!
        pincode: String!
        capacity: String!
        website: String
        createdat: String!
        updatedat: String!
    }
    extend type Query {
        getVenues: [Venue]
        getVenuesByCity(city:String!): [Venue]
        getVenue(id: ID!): Venue
    }
    extend type Mutation{
    registerVenue(name: String!, email: String!, phone: String!, city: String!, state: String!, address: String!, pincode: String!, capacity: String!,website: String): Venue
    # loginVenue(email: String!,password: String!) : Venue!
    updateVenue(id:ID!,name: String!, email: String!, phone: String!, city: String!, state: String!, address: String!, pincode: String!, capacity: String!,website: String): String! 
    deleteVenue(id:ID!): String! 
  }
`
const resolvers = {
    Query: {
        getVenues: async(_, args, { dataSources }, info) => {
            try {
                return (await dataSources.venueAPI.getVenues()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        getVenuesByCity: async(_, {city}, { dataSources }, info) => {
            try {
                return (await dataSources.venueAPI.getVenuesByCity(city)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getVenue(_, args, { dataSources }, info) {
            try {
                return (await dataSources.venueAPI.getVenue(args.id)).data;
            } catch (error) {
                throw new Error(error.data);
            }
        }
    },
    Mutation:{
        async registerVenue(_,args,{dataSources},info){
            try{
                return (await dataSources.venueAPI.registerVenue(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updateVenue(_,args,{dataSources},info){
            try{
                return (await dataSources.venueAPI.updateVenue(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async deleteVenue(_,args,{dataSources},info){
            try{
                return (await dataSources.venueAPI.deleteVenue(args.id)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        }
    }
}
module.exports = {typeDefs, resolvers};