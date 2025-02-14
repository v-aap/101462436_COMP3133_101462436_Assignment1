const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const schema = require('./schema');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is undefined. Check your .env file.");
    process.exit(1);  // Stop the server if no DB URI is provided
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// GraphQL Endpoint
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true // Enable GraphiQL for testing
}));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
