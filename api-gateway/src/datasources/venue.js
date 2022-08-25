const { RESTDataSource } = require('apollo-datasource-rest');

class venueAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://venue:4000';
  }
  willSendRequest(req) {
    req.headers.set("user",JSON.stringify(this.context.req.user));
  }
  async getVenues() {
    return await this.get(`/venues`);
  }

  async getVenuesByCity(city) {
    return await this.get(`/venues`,{city});
  }

  async getVenue(id){
    return await this.get(`/venues/${id}`);
  }
  async getVenuesByHead(id){
    return await this.get(`/venues/head/${id}`);
  }
  async registerVenue(venue){
    try {
      return await this.post(`/venues`,venue)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async updateVenue(venue){
    try {
      return await this.put(`/venues/${venue.id}`,venue)
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async deleteVenue(id){
    try{
      return await this.delete(`/venues/${id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async requestVenue(data){
    try{
      return await this.post(`/venues/book`,data);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async updateVenueStatus(data){
    try{
      return await this.put(`/venues/book/status`,data);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async getVenueBookingDetailsByBookingId(id){
    try{
      return await this.get(`/venues/booking/details`,{
        booking_id:id
      });
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async getVenueBookingDetailsByEventId(id){
    try{
      return await this.get(`/venues/booking/details`,{
        event_id:id
      });
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }

  async getVenueBookings(id){
    try{
      return await this.get(`/venues/bookings/${id}`);
    }catch(error){
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
  async getAvailableVenues(args){
    try {
      return await this.get(`/venues/available`,args);
    } catch (error) {
      throw Error(JSON.stringify(error.extensions.response.body))
    }
  }
}
module.exports = venueAPI;