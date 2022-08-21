const { gql } = require("apollo-server-express");
const {isAuthenticated} = require("../validators/auth");
const typeDefs = gql`
    
    extend type Query {
        fbGetUserPages(longlivedaccesstoken: String!): String!
    }
    extend type Mutation{
        fbGetLongLivedAccessToken(shortlivedaccesstoken: String!): String!
        fbPageData(id:String!,pageaccesstoken:String!): String!
        fbUploadPost(url:String,caption:String,pageid:String!,pageaccesstoken:String!): String!
    }
`
const resolvers = {
    Query: {
        async fbGetUserPages(_, args, { dataSources, req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.socialsAPI.fbGetUserPages(args.longlivedaccesstoken)).data;
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation:{
        async fbGetLongLivedAccessToken(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.socialsAPI.fbGetLongLivedAccessToken(args)).data;
            }catch(err){
                throw new Error(err)
            }
        },
        async fbPageData(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.socialsAPI.fbPageData(args)).data;
            }catch(err){
                throw new Error(err)
            }
        },
        async fbUploadPost(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.socialsAPI.fbUploadPost(args)).data;
            }catch(err){
                throw new Error(err)
            }
        }
    }
}
module.exports = {typeDefs, resolvers};