const { gql, UserInputError, AuthenticationError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const { isAuthenticated, isAdmin } = require("../validators/auth");

const typeDefs = gql`
    type User{
        id: ID
        name: String
        email: String
        phone: String
        role: String
        password: String
        department: String
        createdat: String
        updatedat: String
        image: String
    }
    type AuthUser{
        id: ID
        name: String
        email: String
        phone: String
        role: String
        department: String
        createdat: String
        updatedat: String
        token: String
        image: String
    }
    extend type Query {
        getUsers: [User]
        getUser(id: ID!): User
        getUsersByDepartment(department:String!) : [User]
    }
    extend type Mutation{
    registerUser( email: String!, phone: String!, name: String!, department:String!, role: String, password: String!): User
    loginUser(email: String!,password: String!) : AuthUser!
    updateUser(id:ID!,name:String!,email:String,role:String!,department:String!,phone:String!): String! 
    updatePassword(id:ID!,password:String!): String!
    deleteUser(id:ID!): String! 
    updateProfileImage(id:ID!,image:String!) : String!
    createMassUsers(users:String!): String!
  }
`
const resolvers = {
    Query: {
        getUsers: async(_, args, {dataSources,req} ,info) => {
            try {
                console.log(req.headers.Authorization);
                req.user = await isAuthenticated(req)
                return (await dataSources.usersAPI.getUsers()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getUser(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.usersAPI.getUser(args.id)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getUsersByDepartment(_,{department},{dataSources,req}){
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.usersAPI.getUsersByDepartment(department)).data;
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation:{
        async loginUser(_, args, { dataSources ,req }, info) {
            try {
                const user = (await dataSources.usersAPI.loginUser(args)).data
                delete user.password
                const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "5d" });
                return {...user,token};
            } catch (error) {
                throw new AuthenticationError(error);
            }
        } ,
        async registerUser(_,args,{dataSources,req},info){
            try{
                req.user = await isAdmin(req)
                return (await dataSources.usersAPI.registerUser(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updateUser(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.usersAPI.updateUser(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updatePassword(_,{id,password},{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.usersAPI.updatePassword(id,password)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async deleteUser(_,args,{dataSources,req},info){
            try{
                req.user = await isAdmin(req)
                return (await dataSources.usersAPI.deleteUser(args.id)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async updateProfileImage(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.usersAPI.updateUserProfile(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        },
        async createMassUsers(_,args,{dataSources,req},info){
            try{
                req.user = await isAdmin(req)
                return (await dataSources.usersAPI.createMassUsers(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        }
    }
}
module.exports = {typeDefs, resolvers};