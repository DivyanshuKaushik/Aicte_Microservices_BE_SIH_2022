const { gql, UserInputError } = require("apollo-server-express");
const { isAuthenticated } = require("../validators/auth");

const typeDefs = gql`
    type Venue {
        id: ID!
        name: String!
        email: String!
        phone: String!
        city: String!
        state: String!
        address: String!
        pincode: String!
        image: String!
        capacity: String!
        website: String
        venue_head: ID!
        createdat: String!
        updatedat: String!
    }
    type Booking {
        id: ID!
        event_id: ID!
        venue_id: ID!
        venue_head: ID!
        from_date: String!
        to_date: String!
        time: String!
        status: String!
        createdat: String!
        updatedat: String!
    }

    extend type Query {
        getVenues: [Venue]
        getVenuesByCity(city: String!): [Venue]
        getVenue(id: ID!): Venue
        getVenueBookingDetailsByBookingId(id: ID!): Booking!
        getVenueBookingDetailsByEventId(id: ID!): Booking!
        getVenueBookings(id: ID!): [Booking]
    }
    extend type Mutation {
        registerVenue(
            name: String!
            email: String!
            venue_head: ID!
            phone: String!
            city: String!
            state: String!
            address: String!
            pincode: String!
            image: String!
            capacity: String!
            website: String
        ): Venue
        updateVenue(
            id: ID!
            name: String!
            createdat: String!
            email: String!
            venue_head: ID!
            phone: String!
            city: String!
            state: String!
            address: String!
            pincode: String!
            capacity: String!
            website: String
        ): String!
        deleteVenue(id: ID!): String!
        requestVenue(
            event_id: ID!
            venue_id: ID!
            venue_head: ID!
            from_date: String!
            to_date: String!
            time: String!
        ): String!
        updateVenueStatus(id: ID!, status: String!, createdat: String!): String!
    }
`;
const resolvers = {
    Query: {
        getVenues: async (_, args, { dataSources,req }, info) => {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.getVenues()).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        getVenuesByCity: async (_, { city }, { dataSources,req }, info) => {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.getVenuesByCity(city)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getVenue(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.getVenue(args.id)).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getVenueBookingDetailsByBookingId(
            _,
            args,
            { dataSources,req },
            info
        ) {
            try {
                req.user = await isAuthenticated(req)
                return (
                    await dataSources.venueAPI.getVenueBookingDetailsByBookingId(
                        args.id
                    )
                ).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getVenueBookingDetailsByEventId(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (
                    await dataSources.venueAPI.getVenueBookingDetailsByEventId(
                        args.id
                    )
                ).data;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getVenueBookings(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.getVenueBookings(args.id))
                    .data;
            } catch (error) {
                throw new Error(error);
            }
        },
    },
    Mutation: {
        async registerVenue(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.registerVenue(args)).data;
            } catch (err) {
                throw new UserInputError(err);
            }
        },
        async updateVenue(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.updateVenue(args)).data;
            } catch (err) {
                throw new UserInputError(err);
            }
        },
        async deleteVenue(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.deleteVenue(args.id)).data;
            } catch (err) {
                throw new UserInputError(err);
            }
        },
        async requestVenue(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.requestVenue(args)).data;
            } catch (err) {
                throw new UserInputError(err);
            }
        },
        async updateVenueStatus(_, args, { dataSources,req }, info) {
            try {
                req.user = await isAuthenticated(req)
                return (await dataSources.venueAPI.updateVenueStatus(args))
                    .data;
            } catch (err) {
                throw new UserInputError(err);
            }
        },
    },
};
module.exports = { typeDefs, resolvers };
