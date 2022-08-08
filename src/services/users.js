const { gql, UserInputError } = require("apollo-server-express");

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
        getUser(id: ID!): User
    }
    extend type Mutation{
    registerUser( email: String!, phone: String!, name: String!, department:String!, role: String, password: String!): User
    # loginUser(email: String!,password: String!) : User!
    updateUser(id:ID!,name:String!,email:String,role:String!,department:String!,phone:String!): String! 
    updatePassword(id:ID!,password:String!): String!
    deleteUser(id:ID!): String! 
  }
`
const resolvers = {
    Query: {
        getUsers: async(_, args, { dataSources }, info) => {
            try {
                return (await dataSources.usersAPI.getUsers()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getUser(_, args, { dataSources }, info) {
            try {
                return (await dataSources.usersAPI.getUser(args.id)).data;
            } catch (error) {
                throw new Error(error.data);
            }
        }
    },
    Mutation:{
        async registerUser(_,args,{dataSources},info){
            try{
                return (await dataSources.usersAPI.registerUser(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updateUser(_,args,{dataSources},info){
            try{
                return (await dataSources.usersAPI.updateUser(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updatePassword(_,{id,password},{dataSources},info){
            try{
                return (await dataSources.usersAPI.updatePassword(id,password)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async deleteUser(_,args,{dataSources},info){
            try{
                return (await dataSources.usersAPI.deleteUser(args.id)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        }
    }
}
module.exports = {typeDefs, resolvers};