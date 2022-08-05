const { gql } = require("apollo-server-express");

const typeDefs = gql`
    type User{
        id: ID!
        name: String!
        email: String!
        phone: String!
        role: String!
        password: String!
        department: String!
        created: String
        updated: String
    }
    extend type Query {
        getUsers: [User]
        chat: String
    }
    extend type Mutation{
    registerUser( email: String!, phone: String!, name: String!, department:String!, role: String, password: String!): User
        
    # loginUser(email: String!,password: String!) : User!
    # updateUser(id:ID!,name:String!,email:String,role:String!,department:String!,phone:String!): User! 
    # updateUserPassword(id:ID!): String! 
    # deleteUser(id:ID!): String! 
  }
`
const resolvers = {
    Query: {
        getUsers: async(parent, args, { dataSources }, info) => {
            try {
                return (await dataSources.authAPI.getUsers()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        chat: async(parent, args, { dataSources }, info) => {
            const data = await dataSources.chatAPI.chat();
            return data;
        }
    },
    Mutation:{
        async registerUser(_,args,{dataSources},info){
            try{
                return (await dataSources.authAPI.registerUser(args)).data
            }catch(err){
                throw new Error(err)
            }
        },
    }
}
module.exports = {typeDefs, resolvers};