// var express = require("express");
// var router = express.Router();
// const { uuid } = require("uuidv4");
// const { db } = require("../mongo");

// /* GET users listing. */
// router.get("/", function (req, res, next) {
//   res.send("respond with a resource");
// });

// router.post("/add-many", async (req, res) => {
//   const { nfts } = req.body;
//   const nftsToAdd = nfts.map((nft) => {
//     return {
//       ...nft,
//       _id: uuid(),
//     };
//   });
//   const result = await db().collection("nfts").insertMany(nftsToAdd);
//   res.json({
//     success: true,
//     message: "NFTs added successfully",
//     result,
//   });
// });

// router.get("/all", async (req, res) => {
//   const result = await db().collection("nfts").find().toArray();
//   const newResult = result.map((nft) => {
//     if (nft.coin === 0) {
//       nft.coin = 50;
//     }
//     return nft;
//   });
//   res.json({
//     success: true,
//     message: "NFTs fetched successfully",
//     result,
//   });
// });

// router.get("/get-collection/:collection", async (req, res) => {
//   try {
//     const collectionParam = req.params.collection;
//     const result = await db()
//       .collection("nfts")
//       .find({ "collection.name": collectionParam })
//       .toArray();
//     res.json({
//       success: true,
//       message: "NFTs fetched successfully",
//       result,
//     });
//   } catch (err) {
//     console.log(err);
//     res.json({
//       success: false,
//       error: err.toString(),
//     });
//   }
// });

// router.get("/get-owner/:owner", async (req, res) => {
//   try {
//     const ownerParam = req.params.owner;
//     const result = await db()
//       .collection("nfts")
//       .find({ owner: ownerParam })
//       .toArray();
//     console.log("result ", result);
//     res.json({
//       success: true,
//       message: "NFTs fetched successfully",
//       result,
//     });
//   } catch (err) {
//     console.log(err);
//     res.json({
//       success: false,
//       error: err.toString(),
//     });
//   }
// });

// router.get("/get-by-id/:id", async (req, res) => {
//   try {
//     const idParam = req.params.id;
//     const result = await db().collection("nfts").findOne({ _id: idParam });
//     res.json({
//       success: true,
//       message: "NFT fetched successfully",
//       result,
//     });
//   } catch (err) {
//     console.log(err);
//     res.json({
//       success: false,
//       error: err.toString(),
//     });
//   }
// });
// router.delete("/delete/:id", async (req, res) => {
//   try {
//     const idParam = req.params.id;
//     const result = await db().collection("nfts").deleteOne({ _id: idParam });
//     res.json({
//       success: true,
//       message: "NFT deleted successfully",
//       result,
//     });
//   } catch (err) {
//     console.log(err);
//     res.json({
//       success: false,
//       error: err.toString(),
//     });
//   }
// });

// module.exports = router;
