const express=require('express')
const mongoose=require('mongoose')
const morgan=require('morgan')
const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
const  ExpressValidator=require('express-validator')

require('dotenv').config()

// import routes
const authRoutes=require('./routes/auth')
const userRoutes=require('./routes/user')
const categoryRoutes=require('./routes/category') 
const productRoutes = require('./routes/product')

//app
const app=express()

// db
mongoose.connect(process.env.DATABASE,{
    useUnifiedTopology:true,
   // useCreateIndex:true
}).then(()=> console.log('DB connected'))
.catch(err=>console.log('DB connection error',err))

// middlewares

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(ExpressValidator())


// routes mddleware
app.use("/api",authRoutes);
app.use("/api",userRoutes);
app.use('/api',categoryRoutes);
app.use("/api",productRoutes);


const port=process.env.PORT || 8000

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})
