const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')
const user = require('../models/user')


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid
  let place

  try {
    place = await Place.findById(placeId)
    console.log(place)
  } catch (err) { // this error will be triggered incase theres a error on the request
    const error = new HttpError('Something went wrong while getting the place with the provided id', 500)
    return next(error)
  }

  if (!place) { // this error will be triggered incase theres no place for the provided valid ID
    const error = new HttpError(`Could not find a place for the provided place id of: ${placeId}`, 404)
    return next(error)
  }

  res.json({ place: place.toObject({getters: true}) }) // we use getters: true because mongoose return an id property for each document
}


const getPlacesByUser = async (req, res, next) => {
  const userId = req.params.uid
  let userPlaces
  
  try {
    userPlaces = await Place.find({creator: userId})
    console.log(userPlaces)
  } catch (err) {
    const error = new HttpError('Something went wrong while fetching user places.', 500)
    return next(error)
  }
  
  if (!userPlaces || userPlaces.length === 0){
    return next(new HttpError(`Could not find a place for the provided user id of: ${userId}`, 404))
  }

  res.json({ places: userPlaces.map((place) => place.toObject({getters: true})) })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).json({message:'Invalid inputs passed please check your data', errors: errors.array()}) // errors.array() returns a array of fields that are not validated
  }
  
  const {title, description, address, creator} = req.body // this is a shortcut for this: const title = req.body.title; const description = req.body.description
  let coordinates // we create a coordinates so coordinates is not just scoped to the try block
  try{
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://imagens-revista-pro.vivadecora.com.br/uploads/2021/01/Empire-State-Building-se-destaca-na-paisagem-de-Nova-York-foto-Pinterest.jpg',
    creator
  })

  let user
  try {
    user = await User.findById(creator)
  } catch (err) {
    const error = 'Create place failed, please try again'
    return next(new HttpError(error, 500))
  }

  if(!user) {
    const error = new HttpError('We could not find an user for the provided id', 404)
    return next(error)
  }

  try {
    // REMINDER: while in other mongoose operations if you dont have an collection it creates it automatically, here its a diferent case and you need to have all the collections involved in this transaction already created 
    const sess = await mongoose.startSession() // start a session so we can create a chain of operations "Transactions let you execute multiple operations in isolation and potentially undo all the operations if one of them fails"
    sess.startTransaction()
    await createdPlace.save({ session: sess }) // we pass the session into the save method we mongoose knows what session it belongs to incase of an error
    user.places.push(createdPlace) // the push method on this method is not a standard push but a way of mongoose connect to the user model and add the place ID to the user places (it only adds the ID)
    await user.save({ session: sess })
    await sess.commitTransaction() // only at this point the changes are really saved in the DB incase something fails all the changes would be reverted
  } catch (err) {
    console.log(err)
    return next(new HttpError('Creating place failed.', 500))
  }

  console.log(createdPlace)
  res.status(201).json({ place: createdPlace.toObject({getters: true}) })
}

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({message:'Invalid inputs passed please check your data', errors: errors.array()})
  }

  const placeId = req.params.pid
  const {title, description} = req.body

  let place
  try {
    place = await Place.findById(placeId)

    place.title = title || place.title
    place.description = description || place.description

    await place.save()
  } catch (err) {
    return next(new HttpError('Something went wrong while feching/updating this place.', 500))
  }


  res.status(200).json({ place: place.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId).populate('creator') // populate() function in mongoose is used for populating the data inside the reference
  } catch (err) {
    return next(new HttpError('Something went wrong, could not fetch/delete this place', 500))
  } 

  if (!place) {
    const error = new HttpError('Could not find a place for this ID.', 404)
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    place.creator.places.pull(place)
    await place.creator.save({session: sess})
    await place.remove({session: sess})
    sess.commitTransaction()
  } catch (err) {
    return next(new HttpError('Deleting place failed.', 500))
  }

  res.status(200).json({message: 'Deleted place.'})
}


exports.getPlaceById = getPlaceById
exports.updatePlace = updatePlace
exports.getPlacesByUser = getPlacesByUser
exports.createPlace = createPlace
exports.deletePlace = deletePlace