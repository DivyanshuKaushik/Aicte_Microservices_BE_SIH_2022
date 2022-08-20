const { RESTDataSource } = require('apollo-datasource-rest');

class chatAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://chat:4000';
  }
  willSendRequest(req) {
    req.headers.set("user",JSON.stringify(this.context.req.user));
  }

  async getMessages(seconduser) {
    return await this.get(`/getMessages/${seconduser}`);
  }

  async sendMessage(data) {
    try {
      return await this.post(`/sendMessage`,data)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async sendCommonMessage(data) {
    try {
      return await this.post(`/commonChat`,data)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async getCommonMessages() {
    return await this.get(`/commonChats`);
  }
  async getInbox() {
    return await this.get(`/inbox`);
  }
  
}
module.exports = chatAPI;