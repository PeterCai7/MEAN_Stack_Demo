const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then( hashedPassword => {
      const newUser = new UserSchema({
        email: req.body.email,
        password: hashedPassword
      });
      newUser.save()
        .then(result => {
          res.status(201).json({message: 'User created!', result: result});
        })
        .catch(err => {
          res.status(500).json({
            message: "Invalid authentication credentials!"
          });
        });
    } );
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  UserSchema.findOne({ email: req.body.email })
    .then(user => {
      if(!user) {
        return res.status(401).json({
          message: 'Authentication Failed!'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      //result will be a boolean
      if(!result) {
        return res.status(401).json({
          message: 'Authentication Failed!'
        });
      }
      const token = jwt.sign(
        {email: fetchedUser.email, userId: fetchedUser._id},
        process.env.JWT_KEY,
        {expiresIn: "1h"}
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      })
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      });
    });
};
