const cartSchema = require("../../Schema/cartSchema");
const jwt = require("jsonwebtoken");
const userSchema = require("../../Schema/userSchema");

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { product } = req.body;
    console.log(req.body);
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
        clientnote: p.clientnote,
        total: total,
        // productclass: p.productclass,
        // productcategory: p.productcategory,
        // productdescription: p.productdescription,
        // productnumber: p.productnumber,
        // image: p.image,
        // productoldprice: p.productoldprice,
        // clientnote: p.clientnote,
      };
      products.push(newProduct);
      totalAmount += total; // add the total cost to the totalAmount variable
    }

    const productsWithTotal = products.map((p) => ({
      productname: p.productname,
      productprice: p.productprice,
      quantity: p.quantity,
      clientnote: p.clientnote,
      total: p.total,
      productclass: p.productclass,
      productcategory: p.productcategory,
      productdescription: p.productdescription,
      productnumber: p.productnumber,
      image: p.image,
      productoldprice: p.productoldprice,
      clientnote: p.clientnote,
    }));

    const Cart = new cartSchema({
      product: productsWithTotal,
      totalAmount: totalAmount,
      user: user._id,
    });

    user.cart.unshift(Cart);
    await user.save();
    Cart.user.unshift(user);
    await Cart.save();

    res.status(200).json({
      status: "SUCCESS",
      data: Cart,
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { addToCart };
