const { gql } = require("apollo-server-express");
const {isAuthenticated} = require("../validators/auth");

const typeDefs = gql`
    
    extend type Query {
        fbGetUserPages(longlivedaccesstoken: String!): String!
        twOauth1:String!
        twGetUserDetails(userid:String!):String!

    }
    extend type Mutation{
        fbGetLongLivedAccessToken(shortlivedaccesstoken: String!): String!
        fbPageData(id:String!,pageaccesstoken:String!): String!
        fbUploadPost(url:String,caption:String,pageid:String!,pageaccesstoken:String!): String!
        twCreateTweet(text:String,mediaids:[String],twitter_oauth_token:String!,twitter_oauth_verifier:String!):String!
        twOauth2(oauthtoken:String!,oauthverifier:String!):String!
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
        },
        async twGetUserDetails(_, args, { dataSources, req }, info) {
            try {
                console.log("hello");
                req.user = await isAuthenticated(req)
                console.log(args);
                return (await dataSources.socialsAPI.twGetUserDetails(args.userid)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async twOauth1(_, args, { dataSources, req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.socialsAPI.twOauth1()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
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
        },
        async twCreateTweet(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.socialsAPI.twCreateTweet(args)).data;
            }catch(err){
                throw new Error(err)
            }
        },
        async twOauth2(_,args,{dataSources,req},info){
            try{
                req.user = await isAuthenticated(req)
                return (await dataSources.socialsAPI.twOauth2(args)).data;
            }catch(err){
                throw new Error(err)
            }
        }

    }
}
module.exports = {typeDefs, resolvers};