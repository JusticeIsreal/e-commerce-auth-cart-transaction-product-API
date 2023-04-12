const axios = require("axios");

const postTransaction = async (req, res) => {
  try {
    // const { deliveryaddress, product, card } = req.body;
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

    res.status(200).json({
      status: "SUCCESS",
      data: {
        Transaction,
        authorization_url: paystackRes.data.data.authorization_url,
        reference: paystackRes.data.data.reference,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};
