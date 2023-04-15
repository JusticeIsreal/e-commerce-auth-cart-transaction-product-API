const express = require("express");
const router = express.Router();

const { addToCart } = require("../Controller/Store/Cart");

router.post("/addtocart", addToCart);

module.exports = router;
