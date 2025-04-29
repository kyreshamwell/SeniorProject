// Load environment variables
require('dotenv').config();

// Core Dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const SERVER_URL = "https://seniorproject-jkm4.onrender.com";
const PORT = process.env.PORT || 5001;

// Express App
const app = express();
app.use(express.json());
app.use(cors());

// Serve static assets
app.use('/my-favicon', express.static(path.join(__dirname, 'my-favicon')));
app.use('/password-reset', express.static(path.join(__dirname, 'login', 'password-reset')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/login/login.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'login', 'login.css'));
});

app.get('/login/login.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'login', 'login.js'));
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// MongoDB Setup
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI is undefined. Make sure .env is loaded!");
    process.exit(1);
}
mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Mongoose Models
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    team: { type: String, default: "N/A" },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Number, default: null }
});
const User = mongoose.model('User', UserSchema);

const SettingsSchema = new mongoose.Schema({
    discordURL: { type: String, default: "https://discord.gg/default" }
});
const Settings = mongoose.model('Settings', SettingsSchema);

// Submission Schema for Project Uploads
const SubmissionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});
const Submission = mongoose.model('Submission', SubmissionSchema);

// Middleware for Admin Auth
function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized: No token provided" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ error: "Forbidden: Admins only" });
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Routes
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ error: "Invalid email or password" });
        const token = jwt.sign(
            { userId: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
});

app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Email not found" });
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();
        const resetLink = `${SERVER_URL}/password-reset/reset-password.html?token=${resetToken}`;
        console.log("🔗 Reset Password Link:", resetLink);
        res.json({ message: "Password reset link generated!", resetLink });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
});

app.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ error: "Invalid or expired reset token." });
        user.password = await bcrypt.hash(password, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        res.json({ message: "Password successfully reset! You can now log in." });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
});

app.post("/team-signup", async (req, res) => {
    const { teamName, userName, members } = req.body;
    if (!teamName || !userName || !Array.isArray(members))
        return res.status(400).json({ error: "Missing required fields" });
    try {
        const allUsernames = [userName, ...members];
        const uniqueUsernames = [...new Set(allUsernames)];
        const users = await User.find({ username: { $in: uniqueUsernames } });
        if (users.length !== uniqueUsernames.length)
            return res.status(400).json({ error: "One or more usernames do not exist." });
        const alreadyAssigned = users.filter(user => user.team !== "N/A");
        if (alreadyAssigned.length > 0)
            return res.status(400).json({ error: "One or more users are already assigned to a team." });
        await User.updateMany(
            { username: { $in: uniqueUsernames } },
            { $set: { team: teamName } }
        );
        res.json({ message: "Team signup successful!", team: teamName });
    } catch (error) {
        console.error("Team signup error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
});

app.get("/api/settings/discord", async (req, res) => {
    try {
        let settings = await Settings.findOne({});
        if (!settings) settings = await Settings.create({});
        res.json({ discordURL: settings.discordURL });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/settings/discord", async (req, res) => {
    const { discordURL } = req.body;
    try {
        let settings = await Settings.findOne({});
        if (!settings) settings = await Settings.create({ discordURL });
        else {
            settings.discordURL = discordURL;
            await settings.save();
        }
        res.json({ message: "Discord URL updated successfully", discordURL });
    } catch (error) {
        console.error("Error updating Discord URL:", error);
        res.status(500).json({ error: "Server error updating Discord URL" });
    }
});

app.get("/admin", adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "admin", "admin.html"));
});

app.get('/home/home.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'home', 'home.css'));
});

app.get('/home/home.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'home', 'home.js'));
});

app.get("/api/user", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ username: user.username, role: user.role, email: user.email, team: user.team });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});

// === PROJECT FILE SUBMISSION WITH USERNAME ===
app.post('/submit-project', upload.single('projectFile'), async (req, res) => {
    try {
        const fileInfo = req.file;
        const username = req.body.username;

        if (!fileInfo) return res.status(400).json({ error: "No file uploaded" });
        if (!username) return res.status(400).json({ error: "Username is required" });

        const newSubmission = new Submission({
            username: username,
            originalName: fileInfo.originalname,
            fileName: fileInfo.filename
        });

        await newSubmission.save();

        res.json({
            message: "Project submitted and saved successfully!",
            fileName: fileInfo.filename,
            originalName: fileInfo.originalname
        });
    } catch (err) {
        console.error("File upload error:", err);
        res.status(500).json({ error: "File upload failed" });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at ${SERVER_URL}`);
});
