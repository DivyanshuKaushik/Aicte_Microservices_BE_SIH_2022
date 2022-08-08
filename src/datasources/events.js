const { RESTDataSource } = require('apollo-datasource-rest');

class eventsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://events:4000';
  }

  async getEvents() {
    return await this.get(`/events`);
  }

  async getEvent(id){
    return await this.get(`/events/${id}`);
  }

  async registerEvent(event){
    try {
      return await this.post(`/events`,event)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

//   async updateEvent(event){
//     try {
//       return await this.put(`/events/${event.id}`,event)
//     } catch (error) {
//       throw Error(JSON.stringify(error.extensions.response.body))
//     }
//   }

//   async deleteEvent(id){
//     try{
//       return await this.delete(`/events/${id}`);
//     }catch(error){
//       throw Error(JSON.stringify(error.extensions.response.body))
//     }
//   }

}
module.exports = eventsAPI;