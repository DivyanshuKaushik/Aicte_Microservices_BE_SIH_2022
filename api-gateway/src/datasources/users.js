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

  async getUser(id){
    return await this.get(`/users/${id}`);
  }
  
  async loginUser(user){
    try {
      return await this.post(`/users/login`,user);
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async registerUser(user){
    try {
      return await this.post(`/users`,user)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async updateUser(user){
    try {
      return await this.put(`/users/${user.id}`,user)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async updatePassword(id,password){
    try {
      return await this.put(`/users/${id}/password`,{password})
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    } 
  }

  async deleteUser(id){
    try{
      return await this.delete(`/users/${id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

}
module.exports = usersAPI;