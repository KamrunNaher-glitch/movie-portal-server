const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: "https://movie-portal-client-ki3p5fovr-kamrun-nahers-projects.vercel.app", // Ensure frontend can access backend
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sou5t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        console.log("✅ Connected to MongoDB!");

        const movieCollection = client.db('moviePortal').collection('movie');
        const userCollection = client.db('moviePortal').collection('users');

        // Get all movies
        app.get('/movie', async (req, res) => {
            const result = await movieCollection.find().toArray();
            res.send(result);
        });

        // Get a single movie by ID
        app.get('/movie/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid movie ID" });
                }
                const result = await movieCollection.findOne({ _id: new ObjectId(id) });
                if (!result) {
                    return res.status(404).json({ message: "Movie not found" });
                }
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error" });
            }
        });

        // Add a new movie
        app.post('/movie', async (req, res) => {
            const newMovie = req.body;
            const result = await movieCollection.insertOne(newMovie);
            res.send(result);
        });

        // Update a movie
        app.put('/movie/:id', async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid movie ID" });
            }
            const updateMovie = req.body;
            const result = await movieCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateMovie },
                { upsert: true }
            );
            res.send(result);
        });

        // Delete a movie
        app.delete('/movie/:id', async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid movie ID" });
            }
            const result = await movieCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // Get all users
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        // Add a new user
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        });

        // Update user details
        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const updateDoc = { $set: { lastSignInTime: req.body?.lastSignInTime } };
            const result = await userCollection.updateOne({ email }, updateDoc);
            res.send(result);
        });

        // Delete a user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }
            const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('🎬 Movie Server is running');
});

app.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}`);
});


