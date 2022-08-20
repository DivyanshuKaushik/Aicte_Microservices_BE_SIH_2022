const { gql, UserInputError } = require("apollo-server-express");
const {isAuthenticated} = require("../validators/auth");
const typeDefs = gql`
    extend type Mutation{
        massMailer(emails:[String]!,subject:String!,text:String!): String!
    }
`
const resolvers = {
    Mutation:{
        async massMailer(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.mailAPI.massMailer(args)).data;
            }catch(err){
                throw new UserInputError(err)
            }
        }
       
    }
}
module.exports = {typeDefs, resolvers};