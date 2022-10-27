const axios = require('axios')

const HttpError = require('../models/http-error')


const API_KEY = process.env.GOOGLE_API_KEY // nodemon.json


async function getCoordsForAddress(address) {
  const gmapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  
  const response = await axios.get(gmapsUrl)
  const data = response.data

  if(!data || data.status === 'ZERO_RESULTS') { // google will return the string ZERO_RESULTS if no coordinates were found for the specified address
    const error = new HttpError('Could not find location for the specified address.', 422)
    throw error
  }
  //console.log(data.results[0])

  const coordinates = data.results[0].geometry.location

  return coordinates
}


module.exports = getCoordsForAddress
