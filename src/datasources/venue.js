const { RESTDataSource } = require('apollo-datasource-rest');

class venueAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://venue:4000';
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

}
module.exports = venueAPI;