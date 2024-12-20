const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
 

mongoose.connect('mongodb://localhost:27017/yelp',{
})

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random()* array.length)]


const seedDB = async () => {
    await Campground.deleteMany({})
    for(let i = 0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000)
        const price = Math.floor(Math.random()*20) +10
        const camp = new Campground({ 
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Adipisci blanditiis rerum aspernatur optio placeat maxime nobis! Fugit quam dolorem porro cupiditate libero, veritatis adipisci, repudiandae tempore in deserunt sed consequuntur?',
            price
        })
        await camp.save()
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
})