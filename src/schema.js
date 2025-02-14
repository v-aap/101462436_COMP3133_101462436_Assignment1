const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID, GraphQLFloat, GraphQLList, GraphQLNonNull } = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
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
                const hashedPassword = await bcrypt.hash(args.password, 10);
                const newUser = new User({
                    username: args.username,
                    email: args.email,
                    password: hashedPassword
                });
                return await newUser.save();
            }
        },
        addEmployee: {
            type: EmployeeType,
            args: {
                first_name: { type: GraphQLNonNull(GraphQLString) },
                last_name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                gender: { type: GraphQLString },
                designation: { type: GraphQLNonNull(GraphQLString) },
                salary: { type: GraphQLNonNull(GraphQLFloat) },
                date_of_joining: { type: GraphQLNonNull(GraphQLString) },
                department: { type: GraphQLNonNull(GraphQLString) },
                employee_photo: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const newEmployee = new Employee({
                    ...args
                });
                return await newEmployee.save();
            }
        },
        updateEmployee: {
            type: EmployeeType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                first_name: { type: GraphQLString },
                last_name: { type: GraphQLString },
                email: { type: GraphQLString },
                gender: { type: GraphQLString },
                designation: { type: GraphQLString },
                salary: { type: GraphQLFloat },
                date_of_joining: { type: GraphQLString },
                department: { type: GraphQLString },
                employee_photo: { type: GraphQLString }
            },
            async resolve(parent, args) {
                return await Employee.findByIdAndUpdate(args.id, args, { new: true });
            }
        },
        deleteEmployee: {
            type: EmployeeType,
            args: { id: { type: GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await Employee.findByIdAndDelete(args.id);
            }
        }
    }
});

// Export Schema
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
