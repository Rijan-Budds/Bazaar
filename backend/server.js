const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let db;
function handleDbConnection() {
  db = mysql.createConnection({
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'Rijan@123',
    database: 'Crud'
  });

  db.connect(err => {
    if (err) {
      console.error('Error connecting to DB:', err);
      setTimeout(handleDbConnection, 2000);
    } else {
      console.log('Connected to MySQL database.');
    }
  });

  db.on('error', err => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDbConnection();
    } else {
      throw err;
    }
  });
}
handleDbConnection();

// Login
app.post('/login', (req, res) => {
  const { fname, username, password } = req.body;
  const sql = "SELECT * FROM login WHERE fname = ? AND username = ? AND password = ?";
  db.query(sql, [fname, username, password], (err, data) => {
    if (err) return res.json({ status: "error", message: "Database error" });
    if (data.length > 0) {
      return res.json({ status: "success", message: "Login successful" });
    } else {
      return res.json({ status: "no_record", message: "No matching user found" });
    }
  });
});

// Register
app.post('/register', (req, res) => {
  const { fname, username, password } = req.body;
  const checkSql = "SELECT * FROM login WHERE username = ?";
  db.query(checkSql, [username], (err, data) => {
    if (err) return res.json({ status: "error", message: "Database error" });
    if (data.length > 0) return res.json({ status: "exists", message: "User already exists" });

    const insertSql = "INSERT INTO login (fname, username, password) VALUES (?, ?, ?)";
    db.query(insertSql, [fname, username, password], (err) => {
      if (err) return res.json({ status: "error", message: "Failed to register user" });
      return res.json({ status: "success", message: "User registered successfully" });
    });
  });
});

// Upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Create Post
app.post('/api/posts', upload.single('photo'), (req, res) => {
  const { title, category, conditions, description, price, negotiable, location } = req.body;
  const photo = req.file ? req.file.filename : null;
  const userId = 1; 

  if (!title || !category || !conditions || !description || !price || !photo) {
    return res.json({ status: "error", message: "All fields are required" });
  }

  const insertSql = `
    INSERT INTO posts (title, photo, category, conditions, description, price, negotiable, location, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(insertSql, [title, photo, category, conditions, description, parseFloat(price), negotiable === 'true' ? 1 : 0, location, userId],
    (err, result) => {
      if (err) return res.json({ status: "error", message: "Database error while creating post" });
      return res.json({ status: "success", message: "Post created successfully", postId: result.insertId });
    }
  );
});

// Get Single Post by ID - NEW ENDPOINT (must come before general /api/posts)
app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  console.log('Fetching post with ID:', postId); // Debug log
  
  const sql = `
    SELECT posts.*, login.fname as seller_name 
    FROM posts
    LEFT JOIN login ON posts.user_id = login.id
    WHERE posts.id = ?
  `;
  
  db.query(sql, [postId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    
    if (result.length === 0) {
      console.log('No post found with ID:', postId); // Debug log
      return res.status(404).json({ status: "error", message: "Post not found" });
    }
    
    console.log('Post found:', result[0]); // Debug log
    return res.json({ status: "success", data: result[0] });
  });
});

// Update Post - NEW ENDPOINT
app.put('/api/posts/:id', upload.single('photo'), (req, res) => {
  const postId = req.params.id;
  const { title, category, conditions, description, price, negotiable, location } = req.body;
  const newPhoto = req.file ? req.file.filename : null;

  if (!title || !category || !conditions || !description || !price) {
    return res.json({ status: "error", message: "All fields are required" });
  }

  // First, get the current post to check if we need to delete old photo
  const getCurrentPostSql = "SELECT photo FROM posts WHERE id = ?";
  
  db.query(getCurrentPostSql, [postId], (err, currentResult) => {
    if (err || currentResult.length === 0) {
      return res.json({ status: "error", message: "Post not found" });
    }

    const oldPhoto = currentResult[0].photo;
    const photoToUse = newPhoto || oldPhoto; // Use new photo if uploaded, otherwise keep old one

    const updateSql = `
      UPDATE posts 
      SET title = ?, category = ?, conditions = ?, description = ?, price = ?, 
          negotiable = ?, location = ?, photo = ?
      WHERE id = ?
    `;

    const values = [
      title, 
      category, 
      conditions, 
      description, 
      parseFloat(price), 
      negotiable === 'true' ? 1 : 0, 
      location, 
      photoToUse,
      postId
    ];

    db.query(updateSql, values, (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.json({ status: "error", message: "Database error while updating post" });
      }

      // If we uploaded a new photo and there was an old one, delete the old photo file
      if (newPhoto && oldPhoto && oldPhoto !== newPhoto) {
        const oldPhotoPath = path.join(__dirname, 'uploads', oldPhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      return res.json({ 
        status: "success", 
        message: "Post updated successfully",
        data: { id: postId }
      });
    });
  });
});

// Get All Posts
app.get('/api/posts', (req, res) => {
  const sql = `
    SELECT posts.*, login.fname as seller_name
    FROM posts
    LEFT JOIN login ON posts.user_id = login.id
    ORDER BY posts.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Delete Post
app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  const getPhotoSql = "SELECT photo FROM posts WHERE id = ?";
  db.query(getPhotoSql, [postId], (err, result) => {
    if (err || result.length === 0) {
      return res.json({ status: "error", message: "Post not found" });
    }

    const photoFilename = result[0].photo;
    const deleteSql = "DELETE FROM posts WHERE id = ?";
    db.query(deleteSql, [postId], (err) => {
      if (err) return res.json({ status: "error", message: "Failed to delete post" });

      const photoPath = path.join(__dirname, 'uploads', photoFilename);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      return res.json({ status: "success", message: "Post deleted successfully" });
    });
  });
});

// Get Profile + User's Posts
app.get('/api/profile', (req, res) => {
  const userId = 1; // Replace with session/token later
  const userSql = "SELECT fname, username as email FROM login WHERE id = ?";
  const postsSql = "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC";

  db.query(userSql, [userId], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.status(500).json({ status: "error", message: "User not found" });
    }
    db.query(postsSql, [userId], (err, postResults) => {
      if (err) return res.status(500).json({ status: "error", message: "Database error" });

      const userData = {
        ...userResult[0],
        adsPosted: postResults.length,
        posts: postResults
      };
      return res.json({ status: "success", data: userData });
    });
  });
});

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});