const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID, GraphQLFloat, GraphQLList, GraphQLNonNull } = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Employee = require('./models/Employee');
require('dotenv').config();

// Define User Type
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    })
});

// Define Employee Type
const EmployeeType = new GraphQLObjectType({
    name: 'Employee',
    fields: () => ({
        id: { type: GraphQLID },
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        email: { type: GraphQLString },
        gender: { type: GraphQLString },
        designation: { type: GraphQLString },
        salary: { type: GraphQLFloat },
        date_of_joining: { type: GraphQLString },
        department: { type: GraphQLString },
        employee_photo: { type: GraphQLString }
    })
});

// Define Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        login: {
            type: UserType,
            args: {
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {
                const user = await User.findOne({ email: args.email });
                if (!user) throw new Error('User not found');

                const isMatch = await bcrypt.compare(args.password, user.password);
                if (!isMatch) throw new Error('Invalid credentials');

                return user;
            }
        },
        getAllEmployees: {
            type: new GraphQLList(EmployeeType),
            async resolve() {
                return await Employee.find();
            }
        },
        getEmployeeById: {
            type: EmployeeType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                return await Employee.findById(args.id);
            }
        },
        searchEmployees: {
            type: new GraphQLList(EmployeeType),
            args: {
                designation: { type: GraphQLString },
                department: { type: GraphQLString }
            },
            async resolve(parent, args) {
                let query = {};
                if (args.designation) query.designation = args.designation;
                if (args.department) query.department = args.department;
                return await Employee.find(query);
            }
        }
    }
});

// Define Mutations
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        signup: {
            type: UserType,
            args: {
                username: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {
                const hashedPass
