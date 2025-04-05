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

// Route to verify server is running
app.get('/', (req, res) => {
    res.send('Welcome to the Employee Management API');
});

// GraphQL Endpoint
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true // Enable GraphiQL for testing
}));

// Handle uploads differently based on environment
if (process.env.VERCEL) {
    // In Vercel, we can't write to the filesystem, so we should adapt our upload strategy
    console.log('Running in Vercel environment');
    
    // Here you would implement a solution using a cloud storage service
    // But for simplicity, we'll still try to serve any static files that might be included in the build
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
} else {
    // For local development, we can serve static files
    const uploadsDir = path.join(__dirname, '../uploads');
    app.use('/uploads', express.static(uploadsDir));
    
    // Route to check image uploads directory (only in development)
    app.get('/uploads-info', (req, res) => {
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
}

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI && !process.env.VERCEL) {
    console.error("Error: MONGO_URI is undefined. Check your .env file.");
    process.exit(1);  // Stop the server if no DB URI is provided
}

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Start Server if not in Vercel environment
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the Express app for Vercel
module.exports = app;