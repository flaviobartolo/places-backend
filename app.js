const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')

dotenv.config()

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')


const app = express()

app.use(bodyParser.json()) // this is will parse any incoming request body and convert any json data in there into regular javascript data structures like objects and arrays
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => { // catching unknown routes
  const error = new HttpError('Could not find the page you are looking for')
  throw error // we use throw error instead of next(error) because its going to be a synchronous call since its an unknown route
})

app.use((error, req, res, next) => {  // if we provide a 4 params function, express will know this is a special middleware function and treat it like a error handling middleware
                                      // this function will execute if any middleware function before it yields an error
  
  if (res.headerSent) { // we check if a response has already be sent and if thats the case we return and forward the error 
    return next(error)
  }
  console.log('entrou error middlware')
  console.log(error.message)
  res.status(error.code || 500) // if theres no error code set we default it to 500
  res.json({message: error.message || 'An unexpected error occured.'})

})

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('successfully connected')
    app.listen(5000)
  })
  .catch((err) => {
    console.log(err)
  })
