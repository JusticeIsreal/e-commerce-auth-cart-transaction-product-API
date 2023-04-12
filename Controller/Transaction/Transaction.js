const transactionSchema = require("../../Schema/transactionSchema.js");
const userSchema = require("../../Schema/userSchema.js");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");

// POST TRANSACTION

// const postTransaction = async (req, res) => {
//   try {
//     // const { deliveryaddress, product, card } = req.body;
//     const {
//       deliveryaddress,
//       product,
//       card_number,
//       cvv,
//       expiry_month,
//       expiry_year,
//     } = req.body;

//     // check if the user has a successful token login
//     const auth = req.headers.authorization;
//     if (!auth || !auth.startsWith("Bearer ")) {
//       return res.status(401).json({
//         status: "FAILED",
//         message: "No token provided, You dont have access to this data",
//       });
//     }

//     // split token from bearer and get real value to verify
//     const token = auth.split(" ")[1];
//     const verifyToken = await jwt.verify(token, process.env.SECRET);

//     if (!verifyToken) {
//       return res
//         .status(401)
//         .json({ status: "ERROR", message: "Invalid token access" });
//     }

//     const user = await userSchema.findById(verifyToken.id);

//     if (!user) {
//       res.status(401).json({ msg: "user not found" });
//     }

//     const products = [];
//     let totalAmount = 0;

//     for (const p of product) {
//       const total = p.productprice * p.quantity; // calculate the total cost
//       const newProduct = {
//         productname: p.productname,
//         productprice: p.productprice,
//         quantity: p.quantity,
//         total: total,
//       };
//       products.push(newProduct);
//       totalAmount += total; // add the total cost to the totalAmount variable
//     }

//     const productsWithTotal = products.map((p) => ({
//       productname: p.productname,
//       productprice: p.productprice,
//       quantity: p.quantity,
//       total: p.total,
//     }));

//     // make a request to Paystack to initialize the transaction
//     const headers = {
//       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       "Content-Type": "application/json",
//     };
//     const data = {
//       email: user.useremail,
//       amount: totalAmount * 100, // Paystack amount is in kobo (i.e. 100 kobo = 1 Naira)
//       card: {
//         number: card_number,
//         cvv: cvv,
//         expiry_month: expiry_month,
//         expiry_year: expiry_year,
//       },
//       metadata: {
//         delivery_address: deliveryaddress,
//         products: productsWithTotal,
//       },
//     };
//     const paystackRes = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       data,
//       { headers }
//     );

//     if (paystackRes.data.status !== true) {
//       return res.status(400).json({
//         status: "FAILED",
//         message: "Failed to initialize transaction",
//       });
//     }

//     const Transaction = new transactionSchema({
//       deliveryaddress: deliveryaddress,
//       product: productsWithTotal,
//       totalAmount: totalAmount,
//       paystackRef: paystackRes.data.data.reference,
//     });

//     user.transaction.push(Transaction);
//     await user.save();
//     Transaction.user.push(user);
//     await Transaction.save();

//     res.status(200).json({
//       status: "SUCCESS",
//       data: {
//         Transaction,
//         authorization_url: paystackRes.data.data.authorization_url,
//         reference: paystackRes.data.data.reference,
//       },
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// };

const postTransaction = async (req, res) => {
  try {
    const {
      deliveryaddress,
      product,
      card_number,
      cvv,
      expiry_month,
      expiry_year,
    } = req.body;

    // check if the user has a successful token login
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
        .json({ status: "ERROR", message: "Invalid token access" });
    }

    const user = await userSchema.findById(verifyToken.id);

    if (!user) {
      res.status(401).json({ msg: "user not found" });
    }

    const products = [];
    let totalAmount = 0;

    for (const p of product) {
      const total = p.productprice * p.quantity; // calculate the total cost
      const newProduct = {
        productname: p.productname,
        productprice: p.productprice,
        quantity: p.quantity,
        total: total,
      };
      products.push(newProduct);
      totalAmount += total; // add the total cost to the totalAmount variable
    }

    const productsWithTotal = products.map((p) => ({
      productname: p.productname,
      productprice: p.productprice,
      quantity: p.quantity,
      total: p.total,
    }));

    // make a request to Paystack to initialize the transaction
    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
    const data = {
      email: user.useremail,
      amount: totalAmount * 100, // Paystack amount is in kobo (i.e. 100 kobo = 1 Naira)
      card: {
        number: card_number,
        cvv: cvv,
        expiry_month: expiry_month,
        expiry_year: expiry_year,
      },
      metadata: {
        delivery_address: deliveryaddress,
        products: productsWithTotal,
      },
    };
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      data,
      { headers }
    );

    if (paystackRes.data.status !== true) {
      return res.status(400).json({
        status: "FAILED",
        message: "Failed to initialize transaction",
      });
    }

    const Transaction = new transactionSchema({
      deliveryaddress: deliveryaddress,
      product: productsWithTotal,
      totalAmount: totalAmount,
      paystackRef: paystackRes.data.data.reference,
    });

    user.transaction.push(Transaction);
    await user.save();
    Transaction.user.push(user);
    await Transaction.save();
    console.log("transaction saved");
    const paystackRef = paystackRes.data.data.reference;

    const verifyTransaction = async () => {
      const paystackRes = await axios.get(
        `https://api.paystack.co/transaction/verify/${paystackRef}`,
        { headers }
      );
      console.log("second axios req");
      console.log(paystackRes.data.data.status);
      if (paystackRes.data.data.status === "success") {
        console.log("second axios successfull");
        await transactionSchema
          .findOneAndUpdate(
            { paystackRef },
            { transactionstatus: "successful" },
            { new: true }
          )
          .populate("user")
          .exec((err, transaction) => {
            if (err) {
              return res.status(400).json({
                status: "FAILED",
                message: "Failed to update transaction status",
              });
            }
            console.log("db updated");

            return res.status(200).json({
              status: "SUCCESS",
              message: "Transaction completed successfully",
              data: transaction,
            });
          });
      } else {
        setTimeout(verifyTransaction, 3000);
        console.log("rning again1");
      }
    };

    // setTimeout(verifyTransaction, 3000);
    console.log("rning again 2");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "ERROR",
      message: "Internal Server Error",
    });
  }
};

// fetch all transaction
const allTransaction = async (req, res) => {
  try {
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
    const verifyToken = jwt.verify(token, process.env.SECRET);

    if (!verifyToken) {
      return res
        .status(401)
        .json({ status: "ERROR", message: "Invalide token access" });
    }
    // get all transaction the the database populated by the respective users
    const transaction = await transactionSchema.find({}).populate({
      path: "user",
    });

    // console.log(transaction);
    res.status(200).json({ status: "SUCCESS", data: transaction });
  } catch (error) {
    throw Error(error.message);
  }
};
// fetch single
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
