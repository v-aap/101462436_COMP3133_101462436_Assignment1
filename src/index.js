const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const schema = require('./schema');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins in development (restrict this in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json({ limit: '10mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Route to verify server is running
app.get('/', (req, res) => {
    res.send('Welcome to the Employee Management API');
});

// Route to check image uploads directory
app.get('/uploads-info', (req, res) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
        const files = require('fs').readdirSync(uploadsDir);
        res.json({ 
            status: 'success', 
            directory: uploadsDir,
            fileCount: files.length,
            files: files
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'error', 
            message: err.message,
            directory: uploadsDir
        });
    }
});