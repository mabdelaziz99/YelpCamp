const express = require ('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const {campgroundSchema} = require('./validationSchemas')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const Campground = require('./models/campground')

mongoose.connect('mongodb://localhost:27017/yelp',{
})

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})


const app = express ()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

const validateCampground = (req,res,next) => {
    // Server-side (Joi) validation that works alonside the client-side validation
    const result = campgroundSchema.validate(req.body)
    const {error} = result
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)    
    }else{
            next()
        }
}

app.get('/', (req,res) =>{
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req,res) =>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', catchAsync(async (req,res) =>{
    res.render('campgrounds/new')
}))

app.post('/campgrounds', validateCampground, catchAsync(async(req,res,next) =>{
    const newCampground = new Campground(req.body.campground)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req,res,next) =>{
        const {id} = req.params
        const campground = await Campground.findById(id)
        res.render('campgrounds/show', {campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req,res) =>{
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', {campground})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req,res) =>{
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req,res) => {
    const {id} = req.params
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.all(/(.*)/, (req,res,next) => {
    next(new ExpressError('Page not found!', 404))
})

app.use((err, req,res,next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = "Oh No! Something Went Wrong"
    res.status(statusCode).render('Error', {err})
    res.send()
})

app.listen(3000, ()=>{
    console.log("Listening on Port 3000")
})