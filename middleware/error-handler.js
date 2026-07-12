const {CustomAPIError} = require('../errors/custom-error');


const errorHandler = (err, req, res, next) => {
  console.log(err);
  if(err instanceof CustomAPIError){
    return res.status(err.statusCode).json({ msg:err.message});
  }
  return res.status(500).json({ msg:'Something Went wrong, Please try again later',err:err});
};

module.exports = errorHandler;