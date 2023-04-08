const transactionSchema = require("../../Schema/transactionSchema.js");
const userSchema = require("../../Schema/userSchema.js");
const jwt = require("jsonwebtoken");

// post transaction
const postTransaction = async (req, res) => {
  try {
    const { deliveryaddress, usernumber, product, totalAmount } = req.body;
    // check if the user has a successful token lopgin
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "FAILED",
        message: "No token provided, You dont have access to this data",
      });
    }

    // split token from bearer and get real value to verify
    const token = auth.split(" ")[1];
    const verifyToken = await jwt.verify(token, process.env.SECRET);

    if (!verifyToken) {
      return res
        .status(401)
        .json({ status: "ERROR", message: "Invalide token access" });
    }
    const user = await userSchema.findById(verifyToken.id);

    if (!user) {
      res.status(401).json({ msg: "user not found" });
    }

    const products = [];
    for (const p of product) {
      const newProduct = {
        productname: p.productname,
        productprice: p.productprice,
        quantity: p.quantity,
      };
      products.push(newProduct);
    }
    const Transaction = new transactionSchema({
      deliveryaddress: deliveryaddress,
      usernumber: usernumber,
      product: products,
      totalAmount: totalAmount,
    });

    // console.log(user);
    Transaction.user.push(user);
    await Transaction.save();
    console.log(Transaction);
    res.status(200).json({ status: "SUCCESS", data: Transaction });
  } catch (error) {
    throw Error(error.message);
  }
};

// fetch all transaction
const allTransaction = async (req, res) => {
  try {
    // // check if the user has a successful token lopgin
    // const auth = req.headers.authorization;
    // if (!auth || !auth.startsWith("Bearer ")) {
    //   return res.status(401).json({
    //     status: "FAILED",
    //     message: "No token provided, You dont have access to this data",
    //   });
    // }

    // // split token from bearer and get real value to verify
    // const token = auth.split(" ")[1];
    // const verifyToken = jwt.verify(token, process.en.SECRET);

    // if (!verifyToken) {
    //   return res
    //     .status(401)
    //     .json({ status: "ERROR", message: "Invalide token access" });
    // }
    // get all users the the database
    const transaction = await transactionSchema.find({}).populate({
      path: "user",
    });

    // console.log(transaction);
    res.status(200).json({ status: "SUCCESS", data: transaction });
  } catch (error) {
    throw Error(error.message);
  }
};
// fetch all transaction
const getSingleTransaction = async (req, res) => {
  try {
    // // check if the user has a successful token lopgin
    // const auth = req.headers.authorization;
    // if (!auth || !auth.startsWith("Bearer ")) {
    //   return res.status(401).json({
    //     status: "FAILED",
    //     message: "No token provided, You dont have access to this data",
    //   });
    // }

    // // split token from bearer and get real value to verify
    // const token = auth.split(" ")[1];
    // const verifyToken = jwt.verify(token, process.en.SECRET);

    // if (!verifyToken) {
    //   return res
    //     .status(401)
    //     .json({ status: "ERROR", message: "Invalide token access" });
    // }
    // get all users the the database
    const singleTransaction = await transactionSchema
      .findById(req.params.id)
      .populate({
        path: "user",
      });

    // console.log(transaction);
    res.status(200).json({ status: "SUCCESS", data: singleTransaction });
  } catch (error) {
    throw Error(error.message);
  }
};

// update transaction status
const updateTransaction = async (req, res) => {
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
    const transaction = await transactionSchema.findOneAndUpdate(
      { _id: req.params.id }, // specify the user to update
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: "SUCCESS", data: transaction });
  } catch (error) {
    throw new Error(error.message);
  }
};

const transactionStatus = async (req, res) => {
  try {
    const processingTransactions = await transactionSchema.find({
      status: "Processing",
    });
    const transactionDelivered = await transactionSchema.find({
      status: "Delivered",
    });
    const openTransaction = await transactionSchema.find({
      status: "Open",
    });

    return res.status(200).json({
      success: true,
      Processing: processingTransactions,
      Delivered: transactionDelivered,
      Open: openTransaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// console.log(transactionSchema.filter((item) => item.status === "Processing"));
module.exports = {
  postTransaction,
  updateTransaction,
  allTransaction,
  getSingleTransaction,
  transactionStatus,
};
