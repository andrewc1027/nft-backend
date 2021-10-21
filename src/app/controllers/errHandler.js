const {
  ValidationError,
  DocumentNotFoundError,
  CastError,
} = require('mongoose').Error;

/**
 *
 * @param {Error} err
 * @param {Response} res
 */
async function handler(err, res) {
  if (err instanceof ValidationError) {
    switch (err.type) {
      case 'ModelValidation':
        res.status(400).json({
          message: err.message,
          type: err.type,
        });
        break;
      default:
        res.status(400).json({
          message: err.message,
          type: 'UnknownValidationError',
        });
        break;
    }
  } else if (err instanceof DocumentNotFoundError) {
    res.status(404).json({
      message: err.message,
      type: 'NotFound',
    });
  } else if (err instanceof CastError) {
    res.status(404).json({
      message: 'NotFound',
      type: 'NotFound',
    });
  } else {
    res.status(500).json({
      message: err.message,
      type: 'UnknownError',
    });
  }
}

module.exports = {
  handler,
};
