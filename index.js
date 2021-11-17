/** @format */

const express = require("express");
const { MongoClient, Collection } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// middlewere
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apmnd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("baby_lotion");
    const productsCollection = database.collection("products");
    const babyCareCollection = database.collection("baby_care");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");
    const bookingCollection = database.collection("booking");

    // Get Products API
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });
    app.get("/baby_care", async (req, res) => {
      const cursor = babyCareCollection.find({});
      const babyCare = await cursor.toArray();
      res.send(babyCare);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get("/booking", async (req, res) => {
      const cursor = bookingCollection.find({});
      const booking = await cursor.toArray();
      res.send(booking);
    });

    // Get Single Booking
    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await bookingCollection.findOne(query);
      res.send(order);
    });

    // Post to API
    app.post("/users", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      console.log(users);
      res.json(result);
    });

    app.post("/products", async (req, res) => {
      const result = await productsCollection.insertOne(req.body);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
      console.log(result);
    });

    app.post("/booking", async (req, res) => {
      const result = await bookingCollection.insertOne(req.body);
      res.send(result);
    });

    // Update API
    // // Update Booking Status
    app.put("/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      console.log(updatedStatus);
      const filter = { _id: ObjectId(id) };
      console.log(updatedStatus);
      const result = await bookingCollection
        .updateOne(filter, {
          $set: { status: updatedStatus },
        })
        .then(result => {
          res.send(result);
        });
    });

    // Update Product
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          img: updateProduct.img,
          name: updateProduct.name,
          description: updateProduct.description,
          price: updateProduct.price,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("Updating", req);
      res.json(result);
    });

    // Delete API
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
      console.log(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The server in running.");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
