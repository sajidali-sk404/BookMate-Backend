const router = require("express").Router();
const Book = require("../model/books")

router.post("/addbook", async (req, res) => {
    
    try {
        const book = new Book({
            url: req.body.url,
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            desc: req.body.desc,
            category:req.body.category,
        });
        await book.save();
        res.status(200).json({ massage: "Book Added successfully" })
    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})





router.get("/getbook/:id", async (req, res) => {
    let book;
    const id = req.params.id;
    try {
        book = await Book.findById(id);
        res.status(200).json({ book })
    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

router.put("/updatebook/:id", async (req, res) => {
    const id = req.params.id;
    const { url, title, author, genre, desc, category } = req.body;
    let book;
    try {
      updatedBook = await Book.findByIdAndUpdate(id, {
            url,
            title,
            author,
            genre,
            desc,
            category,
        },
        { new: true }
      );

      if (!updatedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }

        return res.status(200).json({massage: "Data update Successfully",book: updatedBook})
    } catch (error) {
        return res.status(500).json({ massage: "error updating book", error: error.message })
    }
})



// GET books with pagination
router.get('/books', async (req, res) => {
  const limit = parseInt(req.query.limit) || 8; 
  const page = parseInt(req.query.page) || 1; 

  try {
    const books = await Book.find({})
      .skip((page - 1) * limit) 
      .limit(limit); 

    const totalBooks = await Book.countDocuments(); 
    res.status(200).json({
      books,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit), 
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});


router.get('/books/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const books = await Book.find({ category: category });
    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found in this category.' });
    }
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by category', error: error.message });
  }
});

router.get("/random-books", async (req, res) => {
    try {
      const randomBooks = await Book.aggregate([{ $sample: { size: 8 } }]);
      res.status(200).json(randomBooks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

router.delete("/deletebook/:id", async (req, res) => {
    const id  = req.params.id;
    try {
        await Book.findByIdAndDelete(id);
        return res.status(200).json({ massage: "Book Delete successfully" })
    } catch (error) {
        return res.status(500).json({ massage: "Internal server error" })
    }
})


// Search books by title, author, or genre
router.get('/searchBooks', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'No search query provided' });
  }

  try {
    // Use a case-insensitive search to find books by title, author, or genre
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } }, // case-insensitive search for title
        { author: { $regex: query, $options: 'i' } }, // case-insensitive search for author
        { genre: { $regex: query, $options: 'i' } }   // case-insensitive search for genre
      ]
    }).limit(5); // Limit the number of search results

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search results', error: error.message });
  }
});


module.exports = router;