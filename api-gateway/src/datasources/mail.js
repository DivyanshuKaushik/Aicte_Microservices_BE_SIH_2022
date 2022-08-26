const { RESTDataSource } = require('apollo-datasource-rest');

class mailAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://alerts:4000';
  }
  willSendRequest(req) {
    req.headers.set("user",JSON.stringify(this.context.req.user));
  }

  async massMailer(data) {
    try {
      console.log(data)
      return await this.post(`/massMailer`,data)
    } catch (error) {
      console.log(error);
      throw Error(JSON.stringify(error))
    }
  }
}
module.exports = mailAPI;