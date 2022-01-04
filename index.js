const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dcyvy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('DoctorsPortal')
        const DoctorCollection = database.collection('appointment')
        const UsersCollection = database.collection('users')

        app.get('/appointments', async (req, res) => {
            const date = new Date(req.query.date).toLocaleDateString()
            const query = { email: req.query.email, date: date }

            const cursor = DoctorCollection.find(query)
            const appointments = await cursor.toArray()
            res.json(appointments)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await UsersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role) {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            console.log(appointment);
            const result = await DoctorCollection.insertOne(appointment);

            res.json(result)
        })

        //save an user
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await UsersCollection.insertOne(user);
            console.log(user);
            res.json(result)
        })

        //upsert
        app.put('/users', async (req, res) => {
            const user = req.body
            console.log(user);
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await UsersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body
            console.log(user);
            const filter = { email: user.email }

            const updateDoc = { $set: { role: 'admin' } };
            const result = await UsersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

    }
    finally {
        // await client.close();

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(` listening at ${port}`)
})