const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware 

app.use(cors());
app.use(express.json());

// moviePortal
// OVFcGcyi9E32nXNE


// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sou5t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const movieCollection = client.db('moviePortal').collection('movie');
    const userCollection = client.db('moviePortal').collection('users');

    app.get('/movie',async(req,res) =>{
      const cursor = movieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/movie/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await movieCollection.findOne(query);
      res.send(result);
    })

    app.post('/movie',async(req,res) =>{
      const newMovie = req.body;
      console.log(newMovie);
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    })

    app.put('/movie/:id', async(req,res) =>{
      const id = req.params.id;
      const filter = {_id:new ObjectId(id)} 
      const options = {upsert : true} ;
      const updateMovie = req.body;
      const Movie = {
        $set :{
          title : updateMovie.title,
          genre: updateMovie.genere,
          duration: updateMovie.duration,
          releaseYear: updateMovie.releaseYear,
          rating:updateMovie.rating,
          summary: updateMovie.summary,
          poster: updateMovie.poster
        }
      } 
      const result = await movieCollection.updateOne(filter,Movie,options);
      res.send(result);
    })


    app.delete('/movie/:id', async (req,res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    })

    // Users Related API 

    app.get('/users',async (req,res) =>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

      app.post('/users',async(req,res) => {
        const newUser = req.body;
        console.log('creating new user',newUser);
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      })

      app.patch('/users',async (req,res) => {
        const email = req.body.email;
        const filter = {email};
        const updateDoc ={
          $set : {
            lastSignInTime : req.body?.lastSignInTime
          }
        }
        const result = await userCollection.updateOne(filter,updateDoc);
        res.send(result);
      })

      app.delete('/users/:id',async(req,res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await userCollection.deleteOne(query);
        res.send(result);
      })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res) =>{
    res.send('Movie Server is running')
})

app.listen(port,() =>{
    console.log(`Movie Server is running on port: ${port}`)
})


