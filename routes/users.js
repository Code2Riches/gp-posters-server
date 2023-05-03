var express = require("express");
var router = express.Router();
const { uuid } = require("uuidv4");
const { db } = require("../mongo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userSpend = email.includes("codeimmersives.com") ? 1000 : 250;
    const saltRounds = 5; // For prod apps, saltRounds are going to be between 5 and 10
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    user = {
      email,
      password: hash,
      id: uuid(),
      coin: userSpend,
      avatar: "",
      firstName: "",
      lastName: "",
      cartHistory: [],
      cart: [],
    };

    const result = await db().collection("users").insertOne(user);
    res.json({
      success: true,
      message: "User registered successfully",
      result,
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await db().collection("users").findOne({ email });
    if (!user) {
      res
        .json({
          success: false,
          message: "Could not find user",
        })
        .status(204);
      return;
    }

    const storedPassword = user.password;

    const isPasswordCorrect = await bcrypt.compare(password, storedPassword);

    if (!isPasswordCorrect) {
      res
        .json({
          success: false,
          message: "Password was Incorrect",
        })
        .status(204);
      return;
    }
    const userPerms = email.includes("codeimmersives.com") ? "admin" : "user";

    const userData = {
      date: new Date(),
      userId: user.id,
      scope: userPerms,
      email,
    };
    const secretKey = process.env.JWT_SECRET_KEY;

    const exp = Math.floor(Date.now() / 1000) + 60 * 60;
    const payload = {
      userData,
      exp,
    };
    const token = jwt.sign(payload, secretKey);
    const decoded = jwt.verify(token, secretKey);

    const cartHistory = await db()
      .collection("cartorders")
      .find({ user_email: decoded.userData.email })
      .toArray();

    res.json({
      success: true,
      token,
      email,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
      coin: user.coin,
      cart: user.cart,
      cartHistory: cartHistory,
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.get("/message", async (req, res) => {
  const headerTokenKey = process.env.TOKEN_HEADER_KEY;
  const token = req.header(headerTokenKey);
  const secretKey = process.env.JWT_SECRET_KEY;
  try {
    const decoded = jwt.verify(token, secretKey);
    if (!decoded) {
      return res.json({
        success: false,
        message: "ID Token could not be verified",
      });
    }
    if (decoded.userData && decoded.userData.scope === "admin") {
      return res.json({
        success: true,
        message: "Welcome to the secret admin message",
        decoded,
      });
    }
    if (decoded.userData && decoded.userData.scope === "user") {
      return res.json({
        success: true,
        message: "Welcome to the secret user message",
        decoded,
      });
    }
    throw Error("Access Denied");
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.get("/me", async (req, res) => {
  const headerTokenKey = process.env.TOKEN_HEADER_KEY;
  const token = req.header(headerTokenKey);
  const secretKey = process.env.JWT_SECRET_KEY;
  console.log(req);
  console.log(headerTokenKey);
  console.log(JSON.stringify(req.headers));
  console.log(token, secretKey);
  const decoded = jwt.verify(token, secretKey);
  if (decoded) {
    const user = await db()
      .collection("users")
      .findOne({ email: decoded.userData.email });

    const cartHistory = await db()
      .collection("cartorders")
      .find({ user_email: decoded.userData.email })
      .toArray();
    res.json({
      success: true,
      token,
      email: user.email,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
      coin: user.coin,
      cart: user.cart,
      cartHistory: cartHistory,
    });
    console.log("carthistory", cartHistory);
  }
});

router.put("/update-profile", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const avatar = req.body.avatar;
  const email = req.body.email;
  console.log(req.body);
  try {
    const updatedUser = {
      firstName: req.body.firstName,
      lastName,
      avatar,
    };
    console.log(updatedUser);
    const result = await db()
      .collection("users")
      .updateOne({ email: email }, { $set: updatedUser });

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.put("/update-cart", async (req, res) => {
  const email = req.body.email;
  const cart = req.body.cart;
  try {
    const result = await db()
      .collection("users")
      .updateOne({ email: email }, { $push: { cart: cart } });
    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.put("/checkout", async (req, res) => {
  try {
    const email = req.body.email;
    const cart = req.body.cart;
    const total = req.body.total;
    const ids = req.body.ids;
    const balance = req.body.balance;
    const user = await db().collection("users").findOne({ email: email });
    const cartObject = {
      cart: cart,
      user_id: user.id,
      user_email: user.email,
      total: total,
      id: uuid(),
      purchaseDate: new Date(),
    };
    // const manyNfts = await db().collection("nfts").find(_id: {$in: []});
    const newNftOwner = await db()
      .collection("nfts")
      .updateMany({ _id: { $in: ids } }, { $set: { owner: email, coin: 50 } });

    const checkoutOrder = await db()
      .collection("cartorders")
      .insertOne(cartObject);

    const result = await db()
      .collection("users")
      .updateOne(
        { email: email },
        {
          $push: { cartHistory: cartObject.id },
          $set: { cart: [], coin: balance },
        }
      );
    console.log(checkoutOrder);
    res.json({
      success: true,
      result,
      checkoutOrder,
      user,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.put("/update-coin", async (req, res) => {});

router.put("/delete-cart-item", async (req, res) => {
  const email = req.body.email;
  console.log(req.body);
  try {
    // const nft = await db().collection("nfts").findOne({ _id: req.body.id });
    const result = await db()
      .collection("users")
      .updateOne({ email: email }, { $pull: { cart: { _id: req.body._id } } });
    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

module.exports = router;
