const userSchema = require("../../Schema/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// log in as an admin
const loginUser = async (req, res) => {
  // get the email and password from user input
  const { email, password } = req.body;

  try {
    // check if user with that email exist
    const user = await userSchema.findOne({ email });

    // encrypt the password
    const validPassword = await bcrypt.compare(password, user.password);

    // if user have not verified email then no access
    if (user.verified === false) {
      return res.status(403).json({
        status: "ERROR",
        message: "Email has not been verified, Kindly Verify you email",
      });
    }

    // if the email is not found or the password doesnt match return error
    if (!user || !validPassword) {
      return res
        .satus(400)
        .json({ status: "FAILED", message: "Invalid user name or password" });
    }

    // if it matches then create a token with the details
    const userToken = {
      username: user.username,
      id: user.id,
    };

    
    const token = jwt.sign(userToken, process.env.SECRET, { expiresIn: "1d" });

    res.status(200).json({ status: "SUCCESS", data: token });
  } catch (error) {
    throw Error(error.message);
  }
};

module.exports = loginUser;
