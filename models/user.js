const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')


const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    unique: true // creates a index for email that speeds up the query process
  },
  password: {
    type: String,
    require: true,
    minlengh: 6
  },
  image: {
    type: String,
    require: true
  },
  places: [{ // we tell mongoose that an user can have multiple places by wrapping the places reference inside an array
      type: mongoose.Types.ObjectId,
      ref: 'Place',
      require: true
  }]
})

userSchema.plugin(uniqueValidator)


module.exports = mongoose.model('User', userSchema)