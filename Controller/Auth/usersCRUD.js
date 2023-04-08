const userSchema = require("../../Schema/userSchema.js");
const jwt = require("jsonwebtoken");

// To get all successful registered users
const allUsers = async (req, res) => {
  try {
    // check if the user has a successful token lopgin
    // const auth = req.headers.authorization;
    // if (!auth || !auth.startsWith("Bearer ")) {
    //   return res.status(401).json({
    //     status: "FAILED",
    //     message: "No token provided, You dont have access to this data",
    //   });
    // }

    // // split token from bearer and get real value to verify
    // const token = auth.split(" ")[1];
    // const verifyToken = jwt.verify(token, process.env.SECRET);

    // if (!verifyToken) {
    //   return res
    //     .status(401)
    //     .json({ status: "ERROR", message: "Invalide token access" });
    // }
    // get all users the the database
    const users = await userSchema.find();
    res.status(200).json({ status: "SUCCESS", data: users });
  } catch (error) {
    throw Error(error.message);
  }
};

// update user position to give access
const updateUserPosition = async (req, res) => {
  try {
    // check if there is successfull token login
    // const auth = req.headers.authorization;
    // if (!auth || !auth.startsWith("Bearer ")) {
    //   return res.status(401).json({
    //     status: "FAILED",
    //     message: "No token provided, You dont have access to this data",
    //   });
    // }

    // // get token and verify with jwt
    // const token = auth.split(" ")[1];
    // const verifyToken = await jwt.verify(token, process.env.SECRET);
    // if (!verifyToken) {
    //   return res
    //     .status(401)
    //     .json({ status: "ERROR", message: "Invalide token access" });
    // }

    // // find user with token
    // const allowAccess = await userSchema.findOne({
    //   _id: verifyToken.id,
    // });

    // // condition user with access
    // if (allowAccess.verified != true || allowAccess.position != "owner") {
    //   return res.status(401).json({
    //     status: "ERROR",
    //     message: "You are not authorized to perform this action",
    //   });
    // }

    // update user
    const user = await userSchema.findOneAndUpdate(
      { _id: req.params.id }, // specify the user to update
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: "SUCCESS", data: user });
  } catch (error) {
    throw new Error(error.message);
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "FAILED",
        message: "No token provided, You dont have access to this data",
      });
    }
    const token = auth.split(" ")[1];
    const verifyToken = await jwt.verify(token, process.env.SECRET);

    if (!verifyToken) {
      return res
        .status(401)
        .json({ status: "ERROR", message: "Invalide token access" });
    }

    const allowAccess = await userSchema.findOne({
      _id: verifyToken.id,
    });
    if (allowAccess.verified != true || allowAccess.position != "owner") {
      return res.status(401).json({
        status: "ERROR",
        message: "You are not authorized to perform this action",
      });
    }

    const deleteUser = await userSchema.findOneAndDelete({
      _id: req.params.id,
    });
    res
      .status(200)
      .json({ status: "USER DELETe SUCCESSFUL", data: deleteUser });
  } catch (error) {
    throw new Error(error.message);
  }
};

const filterUsers = async (req, res) => {
  try {
    const staffUser = await userSchema.find({ position: "staff" });
    const clinetUser = await userSchema.find({ position: "client" });
    const adminUser = await userSchema.find({ position: "owner" });

    res.status(200).json({
      status: "SUCCESS",
      staff: staffUser,
      client: clinetUser,
      admin: adminUser,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = { filterUsers, allUsers, updateUserPosition, deleteUser };
