class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // adds a message property and forwards it to the Error class
    this.code = errorCode // adds a code property
  }
}

module.exports = HttpError