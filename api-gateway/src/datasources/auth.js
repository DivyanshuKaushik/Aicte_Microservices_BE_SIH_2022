const { RESTDataSource } = require('apollo-datasource-rest');

class authAPI extends RESTDataSource {
  constructor() {
    // Always call super()
    super();
    // Sets the base URL for the REST API
    this.baseURL = 'http://auth:4000';
  }

  async getUsers() {
    // Send a GET request to the specified endpoint
    return this.get(`/users`);
  }

  async registerUser(user){
    return this.post(`/users`,user);
  }

}
module.exports = authAPI;