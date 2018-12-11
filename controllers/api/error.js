exports.notFound = (req, res) => {
  res.status(404).json({
    message: 'not found'
  });
};
