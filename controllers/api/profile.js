exports.edit = (req, res, next) => {
  req.assert('name', 'Name cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    res.status(422).json(errors);
    return;
  }

  req.user.name = req.body.name;
  req.user.save((err) => {
    if (!err) {
      res.status(200).json({
        message: 'ok'
      });
    } else {
      next(err);
    }
  });
};
