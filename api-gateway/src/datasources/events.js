const { RESTDataSource } = require('apollo-datasource-rest');

class eventsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://events:4000';
  }
  willSendRequest(req) {
    req.headers.set("user",JSON.stringify(this.context.req.user));
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

  async updateEvent(event){
    try {
      return await this.put(`/events/${event.id}`,event)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async deleteEvent(id){
    try{
      return await this.delete(`/events/${id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async inviteUsers(data){
    try{
      return await this.post(`/events/${data.event_id}/invite`,data);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async getInvites(event_id){
    try{
      return await this.get(`/events/${event_id}/invites`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  
  async getInvitedEvents(user_id){
    try{
      return await this.get(`/events/invited/${user_id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async assignTasks(data){
    try{
      return await this.post(`/events/assigntasks`,data);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async getTasksByEvent(event_id){
    try{
      return await this.get(`/events/tasks/event/${event_id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async getTasksByUser(user_id){
    console.log("user",user_id);
    try{
      return await this.get(`/events/tasks/user/${user_id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async updateEventStatus(args){
    try{
      return await this.put(`/events/${args.id}/status`,args);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async submitFeedback(data){
    try{
      return await this.post(`/events/feedback`,data);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async getFeedbacks(event_id){
    try{
      return await this.get(`/events/feedback/${event_id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
}
module.exports = eventsAPI;