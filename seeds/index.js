const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Post = require('../models/post');

mongoose.connect('mongodb://localhost:27017/capture-ittemp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Post.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 187);
        const camp = new Post({
            author : '60e5780290a72046ac73502e',
            location: `${cities[random1000].city}, ${cities[random1000].country}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "This is Default Post by Admin",
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].lng,
                    cities[random1000].lat,
                ]
            },
            images : {
                url: 'https://res.cloudinary.com/sanskar151/image/upload/v1620919955/Project/d2j85tcwd1dz65jiis4r.jpg',
                filename: 'YelpCamp/hughsdzdte0wecgjivci'
              }

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})