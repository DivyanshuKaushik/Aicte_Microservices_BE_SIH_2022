const { AuthenticationError } = require('apollo-server-core')
const jwt = require('jsonwebtoken')

// check is user is admin 
const isAdmin = async req =>{
    try{
        const token = req.headers.authorization
        if(!token) throw new AuthenticationError("Missing Auth Token!")
        const user = jwt.verify(token,process.env.JWT_SECRET)
        if(!user) throw new AuthenticationError("Token Expired!")
        if(user.role!=='admin') throw new AuthenticationError("Unauthorized")
        return user
    }catch(err){
        throw new AuthenticationError(err)
    }
}
const isVenueHead = async req =>{
    try{
        const token = req.headers.authorization
        if(!token) throw new AuthenticationError("Missing Auth Token!")
        const user = jwt.verify(token,process.env.JWT_SECRET)
        if(!user) throw new AuthenticationError("Token Expired!")
        if(user.role!=='admin' || user.role!=='venue-head') throw new AuthenticationError("Unauthorized")
        return user
    }catch(err){
        throw new AuthenticationError(err)
    }
}
const isTeamHead = async req =>{
    try{
        const token = req.headers.authorization
        if(!token) throw new AuthenticationError("Missing Auth Token!")
        const user = jwt.verify(token,process.env.JWT_SECRET)
        if(!user) throw new AuthenticationError("Token Expired!")
        if(user.role!=='admin' || user.role!=='team-head' ) throw new AuthenticationError("Unauthorized")
        return user
    }catch(err){
        throw new AuthenticationError(err)
    }
}
const isSocialTeam = async req =>{
    try{
        const token = req.headers.authorization
        if(!token) throw new AuthenticationError("Missing Auth Token!")
        const user = jwt.verify(token,process.env.JWT_SECRET)
        if(!user) throw new AuthenticationError("Token Expired!")
        if(user.role!=='admin' || user.role!=='social-team') throw new AuthenticationError("Unauthorized")
        return user
    }catch(err){
        throw new AuthenticationError(err)
    }
}

// check if user is authenticated 
const isAuthenticated = async req =>{
    try{
        const token = req.headers.authorization
        if(!token) throw new AuthenticationError("Missing Auth Token!")
        const user = jwt.verify(token,process.env.JWT_SECRET)
        if(!user) throw new AuthenticationError("Token Expired!")
        return user
    }catch(err){
        throw new AuthenticationError(err)
    }
}
module.exports = {isAdmin,isAuthenticated,isSocialTeam,isTeamHead,isVenueHead}