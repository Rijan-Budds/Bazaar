const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Session configuration
app.use(session({
  secret: 'your_secret_key_change_this_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// CORS configuration - important to allow credentials
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, // This is crucial for sessions to work
};
app.use(cors(corsOptions));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection with reconnection handling
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

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      status: "error", 
      message: "Authentication required. Please log in." 
    });
  }
  next();
};

// LOGIN ENDPOINT - Updated with session management
app.post('/login', (req, res) => {
  const { fname, username, password } = req.body;
  
  // Validate input
  if (!fname || !username || !password) {
    return res.json({ 
      status: "error", 
      message: "All fields are required" 
    });
  }

  const sql = "SELECT * FROM login WHERE fname = ? AND username = ? AND password = ?";
  db.query(sql, [fname, username, password], (err, data) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ status: "error", message: "Database error" });
    }
    
    if (data.length > 0) {
      // Store user info in session
      req.session.user = {
        id: data[0].id,
        fname: data[0].fname,
        username: data[0].username
      };
      
      console.log("User logged in:", req.session.user);
      
      return res.json({ 
        status: "success", 
        message: "Login successful",
        user: {
          id: data[0].id,
          fname: data[0].fname,
          username: data[0].username
        }
      });
    } else {
      return res.json({ 
        status: "no_record", 
        message: "Invalid credentials. Please check your username and password." 
      });
    }
  });
});

// LOGOUT ENDPOINT - New endpoint to properly handle logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.json({ status: "error", message: "Could not log out properly" });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    return res.json({ status: "success", message: "Logged out successfully" });
  });
});

// REGISTER ENDPOINT - Same as before but with better error handling
app.post('/register', (req, res) => {
  const { fname, username, password } = req.body;
  
  // Validate input
  if (!fname || !username || !password) {
    return res.json({ 
      status: "error", 
      message: "All fields are required" 
    });
  }

  const checkSql = "SELECT * FROM login WHERE username = ?";
  db.query(checkSql, [username], (err, data) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ status: "error", message: "Database error" });
    }
    
    if (data.length > 0) {
      return res.json({ 
        status: "exists", 
        message: "User with this email already exists" 
      });
    }

    const insertSql = "INSERT INTO login (fname, username, password) VALUES (?, ?, ?)";
    db.query(insertSql, [fname, username, password], (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.json({ status: "error", message: "Failed to register user" });
      }
      return res.json({ 
        status: "success", 
        message: "User registered successfully" 
      });
    });
  });
});

// MULTER SETUP - File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// CREATE POST ENDPOINT - Updated with proper authentication
app.post('/api/posts', requireAuth, upload.single('photo'), (req, res) => {
  const { title, category, conditions, description, price, negotiable, location } = req.body;
  const photo = req.file ? req.file.filename : null;
  const userId = req.session.user.id; // Get from session

  // Validate required fields
  if (!title || !category || !conditions || !description || !price || !photo) {
    return res.json({ 
      status: "error", 
      message: "All fields including photo are required" 
    });
  }

  const insertSql = `
    INSERT INTO posts (title, photo, category, conditions, description, price, negotiable, location, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    title, 
    photo, 
    category, 
    conditions, 
    description, 
    parseFloat(price), 
    negotiable === 'true' ? 1 : 0, 
    location, 
    userId
  ];

  db.query(insertSql, values, (err, result) => {
    if (err) {
      console.error("Insert post error:", err);
      return res.json({ 
        status: "error", 
        message: "Database error while creating post" 
      });
    }
    return res.json({ 
      status: "success", 
      message: "Post created successfully", 
      postId: result.insertId 
    });
  });
});

// GET SINGLE POST BY ID - Updated with better error handling
app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  
  if (!postId || isNaN(postId)) {
    return res.status(400).json({ 
      status: "error", 
      message: "Invalid post ID" 
    });
  }
  
  const sql = `
    SELECT posts.*, login.fname as seller_name 
    FROM posts
    LEFT JOIN login ON posts.user_id = login.id
    WHERE posts.id = ?
  `;
  
  db.query(sql, [postId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        status: "error", 
        message: "Database error" 
      });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ 
        status: "error", 
        message: "Post not found" 
      });
    }
    
    return res.json({ 
      status: "success", 
      data: result[0] 
    });
  });
});

// UPDATE POST ENDPOINT - Updated with ownership verification
app.put('/api/posts/:id', requireAuth, upload.single('photo'), (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.id;
  const { title, category, conditions, description, price, negotiable, location } = req.body;
  const newPhoto = req.file ? req.file.filename : null;

  // Validate required fields
  if (!title || !category || !conditions || !description || !price) {
    return res.json({ 
      status: "error", 
      message: "All fields are required" 
    });
  }

  // First, get the current post and verify ownership
  const getCurrentPostSql = "SELECT photo FROM posts WHERE id = ? AND user_id = ?";
  
  db.query(getCurrentPostSql, [postId, userId], (err, currentResult) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ status: "error", message: "Database error" });
    }
    
    if (currentResult.length === 0) {
      return res.json({ 
        status: "error", 
        message: "Post not found or you don't have permission to edit it" 
      });
    }

    const oldPhoto = currentResult[0].photo;
    const photoToUse = newPhoto || oldPhoto; // Use new photo if uploaded, otherwise keep old one

    const updateSql = `
      UPDATE posts 
      SET title = ?, category = ?, conditions = ?, description = ?, price = ?, 
          negotiable = ?, location = ?, photo = ?
      WHERE id = ? AND user_id = ?
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
      postId,
      userId
    ];

    db.query(updateSql, values, (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.json({ 
          status: "error", 
          message: "Database error while updating post" 
        });
      }

      // If we uploaded a new photo and there was an old one, delete the old photo file
      if (newPhoto && oldPhoto && oldPhoto !== newPhoto) {
        const oldPhotoPath = path.join(__dirname, 'uploads', oldPhoto);
        if (fs.existsSync(oldPhotoPath)) {
          try {
            fs.unlinkSync(oldPhotoPath);
          } catch (unlinkErr) {
            console.error("Error deleting old photo:", unlinkErr);
          }
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

// GET ALL POSTS - Same as before
app.get('/api/posts', (req, res) => {
  const sql = `
    SELECT posts.*, login.fname as seller_name
    FROM posts
    LEFT JOIN login ON posts.user_id = login.id
    ORDER BY posts.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        status: "error", 
        message: "Database error" 
      });
    }
    res.json(results);
  });
});

// DELETE POST ENDPOINT - Updated with ownership verification
app.delete('/api/posts/:id', requireAuth, (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.id;
  
  // First check if the post belongs to the logged-in user
  const checkOwnershipSql = "SELECT photo FROM posts WHERE id = ? AND user_id = ?";
  
  db.query(checkOwnershipSql, [postId, userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ status: "error", message: "Database error" });
    }
    
    if (result.length === 0) {
      return res.json({ 
        status: "error", 
        message: "Post not found or you don't have permission to delete it" 
      });
    }

    const photoFilename = result[0].photo;
    const deleteSql = "DELETE FROM posts WHERE id = ? AND user_id = ?";
    
    db.query(deleteSql, [postId, userId], (err) => {
      if (err) {
        console.error("Delete error:", err);
        return res.json({ status: "error", message: "Failed to delete post" });
      }

      // Delete the photo file if it exists
      if (photoFilename) {
        const photoPath = path.join(__dirname, 'uploads', photoFilename);
        if (fs.existsSync(photoPath)) {
          try {
            fs.unlinkSync(photoPath);
          } catch (unlinkErr) {
            console.error("Error deleting photo file:", unlinkErr);
          }
        }
      }
      
      return res.json({ 
        status: "success", 
        message: "Post deleted successfully" 
      });
    });
  });
});

// GET PROFILE + USER'S POSTS - Updated with proper authentication
app.get('/api/profile', requireAuth, (req, res) => {
  const userId = req.session.user.id; // Get from session
  
  const userSql = "SELECT id, fname, username as email FROM login WHERE id = ?";
  const postsSql = "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC";

  db.query(userSql, [userId], (err, userResult) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        status: "error", 
        message: "Database error while fetching user" 
      });
    }
    
    if (userResult.length === 0) {
      return res.status(404).json({ 
        status: "error", 
        message: "User not found" 
      });
    }
    
    db.query(postsSql, [userId], (err, postResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          status: "error", 
          message: "Database error while fetching posts" 
        });
      }

      const userData = {
        ...userResult[0],
        adsPosted: postResults.length,
        posts: postResults
      };
      
      return res.json({ 
        status: "success", 
        data: userData 
      });
    });
  });
});

// CHECK AUTHENTICATION STATUS - New endpoint to check if user is logged in
app.get('/api/auth/status', (req, res) => {
  if (req.session.user) {
    return res.json({ 
      status: "success", 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    return res.json({ 
      status: "success", 
      authenticated: false 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.json({ 
        status: "error", 
        message: "File too large. Maximum size is 5MB." 
      });
    }
  }
  console.error("Unhandled error:", error);
  res.status(500).json({ 
    status: "error", 
    message: "Internal server error" 
  });
});

// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});