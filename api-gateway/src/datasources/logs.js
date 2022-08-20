const { RESTDataSource } = require('apollo-datasource-rest');

class logsAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://logs:4000';
    }
    willSendRequest(req) {
        req.headers.set("user",JSON.stringify(this.context.req.user));
    }

    async getLogs() {
        const logs = await this.get('/logs');
        return logs;
    }
    async getLogsByDate(year,month,day){
        const logs = await this.get(`/logs?year=${year}&month=${month}&day=${day}`);
        return logs;
    }
    async getLogsByMonth(year,month){
        const logs = await this.get(`/logs?year=${year}&month=${month}`);
        return logs;
    }
    async getLogsByYear(year){
        const logs = await this.get(`/logs?year=${year}`);
        return logs;
    }
}
module.exports = logsAPI;