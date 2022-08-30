const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/places-routes')

const app = express()

app.use('/api/places', placesRoutes)


app.use((error, req, res, next) => {  // if we provide a 4 params function, express will know this is a special middleware function and treat it like a error handling middleware
                                      // this function will execute if any middleware function before it yields an error
  
  if (res.headerSent) { // we check if a response has already be sent and if thats the case we return and forward the error 
    return next(error)
  }
  
  res.status(error.code || 500) // if theres no error code set we default it to 500
  res.json({message: error.message || 'An unexpected error occured.'})

})


app.listen(5000)