const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID, GraphQLFloat, GraphQLList, GraphQLNonNull } = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Utility function to save base64 images
const saveBase64Image = (base64Data, filename) => {
  // Skip if not a base64 image
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return base64Data; // Return as is if not a base64 image
  }

  // Extract the actual base64 content
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    return null;
  }
  
  const buffer = Buffer.from(matches[2], 'base64');
  const filePath = path.join(uploadsDir, filename);
  
  fs.writeFileSync(filePath, buffer);
  return filename; // Return just the filename to store in the database
};

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
                if (args.designation) query.designation = new RegExp(args.designation, 'i');
                if (args.department) query.department = new RegExp(args.department, 'i');
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
                let photoPath = args.employee_photo;
                
                // If there's a base64 image, save it to a file
                if (photoPath && photoPath.startsWith('data:image')) {
                    // Generate a unique filename using employee name and timestamp
                    const filename = `${args.first_name.toLowerCase()}_${Date.now()}.jpg`;
                    photoPath = saveBase64Image(photoPath, filename);
                }
                
                const newEmployee = new Employee({
                    ...args,
                    employee_photo: photoPath
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
                // If there's a new image upload that's base64
                if (args.employee_photo && args.employee_photo.startsWith('data:image')) {
                    // Find the employee to get the first name if it's not provided in the update
                    let employee = null;
                    if (!args.first_name) {
                        employee = await Employee.findById(args.id);
                    }
                    
                    // Use the provided first name or get it from the database
                    const firstName = args.first_name || (employee ? employee.first_name : 'employee');
                    
                    // Generate a unique filename
                    const filename = `${firstName.toLowerCase()}_${Date.now()}.jpg`;
                    args.employee_photo = saveBase64Image(args.employee_photo, filename);
                }
                
                return await Employee.findByIdAndUpdate(args.id, args, { new: true });
            }
        },
        deleteEmployee: {
            type: EmployeeType,
            args: { id: { type: GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                const employee = await Employee.findById(args.id);
                if (employee && employee.employee_photo) {
                    const photoPath = path.join(uploadsDir, employee.employee_photo);
                    // Only delete if the file exists and is within our uploads directory
                    if (fs.existsSync(photoPath) && photoPath.startsWith(uploadsDir)) {
                        try {
                            fs.unlinkSync(photoPath);
                        } catch (err) {
                            console.error('Error deleting employee photo:', err);
                        }
                    }
                }
                
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