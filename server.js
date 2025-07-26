const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const collection = require('./db.js');
const bcrypt = require('bcrypt');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const passport = require('./auth');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const session = require('express-session');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


// Initialize session
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
}));

//middleware
const localAuthmiddleware = passport.authenticate('local', {session : true});

// Passport initialization
app.use(passport.initialize());

// Serve static files (like CSS, JS, images) from the "public" folder
app.use(express.static("public"));

// Route for the search box
app.get('/',(req, res) => {
    res.render("index"); // Assuming index.ejs contains the search box
});

// Signup page
app.get('/signup', (req, res) => {
    res.render("signup");
});

// After signup page
app.get('/aftersignup', (req, res) => {
    res.render("aftersignup");
});

// Homepage
app.get('/home', localAuthmiddleware, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        // Redirect the user to the login page if not logged in
        return res.redirect('/login');
    }
    res.render("home");
});


//profile
app.get('/profile' , async (req, res) => {
    const user = await collection.findOne({ email: req.body.email });
    res.render("profile", {
        username: user.username,
        email: user.email
    })
});
// DB signup connection 
app.post("/signup", async (req, res) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };

    // Check if the user already exists
    const existingUser = await collection.findOne({ email: data.email });
    if (existingUser) {
        res.send("Email Already Exist");
        console.log("Email Already Exist");
    } else {
        // Hash password
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRound);
        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        console.log(userdata);
        res.render("aftersignup");  
    }
});

// Login user
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });
        if (!check) {
            res.send("Email not Foundd");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            res.render("home");
        } else {
            res.send("Wrong Password");
        }
    } catch {
        res.send("Wrong Details");
    }
});


const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Function to generate content using Google Generative AI
const generate = async (prompt) => {
    try {
       const result = await model.generateContent(prompt);
       console.log(result.response.text());
       return result.response.text();
    } catch (err) {
        console.log(err);
    }
};


// Route to display result
app.get('/api/content', async (req, res) => {
    try {
        const data = req.query.search; // Retrieve query parameter for GET request
        if (!data) {
            return res.send("No search query provided!");
        }
        
        const result = await generate(data); // Generate result
        

        // Render the result page
        res.render('result', { query: data, output: result });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});
// Start the server
app.listen(3000, () => {
    console.log('server is running on port 3000');
});
