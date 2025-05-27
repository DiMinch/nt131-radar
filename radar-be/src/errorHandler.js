const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'FirebaseError') {
      return res.status(500).json({
        error: 'Database operation failed',
        details: err.message
      });
    }
  
    res.status(500).json({
      error: 'Something went wrong!',
      message: err.message
    });
  };
  
  module.exports = errorHandler;