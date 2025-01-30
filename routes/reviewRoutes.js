const router = require("express").Router();
const Review = require("../model/reviews")
const Book = require("../model/books");

// Add a new review for a specific book
router.post("/books/:id/reviews", async (req, res) => {
    const bookId = req.params.id;
    const { reviewerName, rating, comment } = req.body;

    try {
        const book = await Book.findById(bookId); // Check if the book exists
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const review = new Review({
            bookId,
            reviewerName,
            rating,
            comment,
        });
        await review.save();
        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

//  Retrieve reviews for a specific book
router.get("/books/:id/reviews", async (req, res) => {
    const bookId = req.params.id;
    try {
        const reviews = await Review.find({ bookId: bookId });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/reviews/:id', async (req, res) => {
    const reviewId = req.params.id;
  
    try {
      const review = await Review.findById(reviewId); // Find the review by its ID
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.status(200).json(review); // Return the review if found
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });




//  Update an existing review

router.put("/reviews/:id", async (req, res) => {
    const reviewId = req.params.id;
    const { reviewerName, rating, comment } = req.body;

    try {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { reviewerName, rating, comment },
            { new: true }  // Return the updated document
        );
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json({ message: "Review updated successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

//  Delete a review API
router.delete("/reviews/:id", async (req, res) => {
    const reviewId = req.params.id;

    try {
        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});




module.exports = router;