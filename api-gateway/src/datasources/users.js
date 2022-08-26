const { RESTDataSource } = require('apollo-datasource-rest');

class usersAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://users:4000';
  }
  willSendRequest(req) {
    req.headers.set("user",JSON.stringify(this.context.req.user));
  }

  async getUsers() {
    return await this.get(`/users`);
  }
  async getUsersByOrg(id){
    return await this.get(`/users/org/${id}`);
  }

  async getUser(id){
    return await this.get(`/users/${id}`);
  }
  async getUsersByDepartment(department){
    return await this.get(`/users?department=${department}`)
  }
  async loginUser(user){
    try {
      return await this.post(`/users/login`,user);
    } catch (error) {
      throw Error(JSON.stringify(error))
    }
  }
  async registerUser(user){
    try {
      return await this.post(`/users`,user)
    } catch (error) {
      throw Error(JSON.stringify(error))
    }
  }
  async registerOrgUser(data){
    try {
      return await this.post(`/users/org`,data)
    } catch (error) {
      throw Error(JSON.stringify(error))
    }
  }
  async createMassUsers(users){
    try {
      return await this.post(`/createMassUsers`,users)
    } catch (error) {
      throw Error(JSON.stringify(error))
    }
  }



  async updateUser(user){
    try {
      return await this.put(`/users/${user.id}`,user)
    } catch (error) {
      throw Error(JSON.stringify(error))
    }
  }
  async updateUserProfile(args){
    try {
      return await this.put(`/users/profile/${args.id}`,args)
    } catch (error) {
      throw Error(JSON.stringify(error))
    }
  }
  async updatePassword(id,password){
    try {
      return await this.put(`/users/${id}/password`,{password})
    } catch (error) {
      throw Error(JSON.stringify(error))
    } 
  }

  async deleteUser(id){
    try{
      return await this.delete(`/users/${id}`);
    }catch(error){
      throw Error(JSON.stringify(error))
    }
  }

}
module.exports = usersAPI;  