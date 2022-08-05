const { RESTDataSource } = require('apollo-datasource-rest');

class chatAPI extends RESTDataSource {
  constructor() {
    // Always call super()
    super();
    // Sets the base URL for the REST API
    this.baseURL = 'http://chat:4000';
  }

  async chat() {
    // Send a GET request to the specified endpoint
    return this.get(`/`);
  }

}
module.exports = chatAPI;