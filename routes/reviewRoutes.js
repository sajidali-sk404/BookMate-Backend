const router = require("express").Router();
const Review = require("../model/reviews");
const Book = require("../model/books");

// ✅ Add a new review for a specific book
const jwt = require ("jsonwebtoken");
const User = require ("../model/user.js");

router.post("/books/:id/reviews", async (req, res) => {
  const bookId = req.params.id;
  const { rating, comment } = req.body;

  try {
    // 1. Extract token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user
    const user = await User.findById(decoded.id).select("_id username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Save review with user ref
    const review = new Review({
      bookId,
      user: user._id, // ✅ assign user here
      rating,
      comment,
    });

    await review.save();
    const populatedReview = await review.populate("user", "username email");
res.status(201).json({ message: "Review added successfully", review: populatedReview });
    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
;


// ✅ Retrieve reviews for a specific book
router.get("/books/:id/reviews", async (req, res) => {
  const bookId = req.params.id;
  try {
    const reviews = await Review.find({ bookId })
      .populate("user", "_id username") // only user id + name
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ Get a single review
router.get("/reviews/:id", async (req, res) => {
  const reviewId = req.params.id;

  try {
    const review = await Review.findById(reviewId).populate("user", "name");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(review);
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Update an existing review
router.put("/reviews/:id", async (req, res) => {
  const reviewId = req.params.id;
  const { rating, comment } = req.body;

  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { rating, comment },
      { new: true, runValidators: true }
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Delete a review
router.delete("/reviews/:id", async (req, res) => {
  const reviewId = req.params.id;

  try {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
