const express = require("express");
const { TwitterApi } = require("twitter-api-v2");
const cors = require("cors");
const axios = require("axios"); 
const jwt = require("jsonwebtoken"); 
const app = express();
app.use(express.json());
const User = require("./models/user.model.js"); 
const Post=require("./models/Post.js")
const SocialAccount=require("./models/socialAccount.model.js")

const {connectDb}=require('./models/db');


const JWT_SECRET = "mysecretkey";
const OAuth = require("oauth").OAuth;
const CLIENT_ID =
  "";
const CLIENT_SECRET = "";
const appKey = "j";
const appSecret = "";
(async () => {
  console.log("i am called");
  try {
    await connectDb();
    console.log("Database connection successful");
  } catch (err) {
    console.log("There is an error", err);
  }
})();


// ✅ Correct OAuth 1.0a client (v1.1 API)
const client = new TwitterApi({});

app.get("/tweet", async (req, res) => {
  const text = "rdx";

  if (!text) return res.status(400).json({ error: "Tweet text is required" });

  try {
    const tweet = await client.v2.tweet(text);
    console.log("✅ Tweet posted:", tweet);
    res.status(200).json({ message: "Tweet posted!", tweetId: tweet.id_str });
  } catch (error) {
    console.error("❌ Tweet failed:", error);
    res
      .status(500)
      .json({ error: "Tweet failed", details: error.data || error.message });
  }
});

const allowedOrigin = 'http://localhost:8080';

app.use(cors({
  origin: "http://localhost:8080", 
  credentials: false 
}));



app.get("/api/auth/google", (req, res) => {
  console.log("GET /api/auth/google called");

  const redirect_uri = "http://localhost:5000/api/auth/google/callback";
  console.log("Redirect URI set:", redirect_uri);

  const scope = "openid email profile";
  console.log("Scope set:", scope);

  const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&prompt=select_account`;
  console.log("Constructed Google Auth URL:", authURL);

  res.redirect(authURL);
  console.log("Redirected to Google Auth URL");
});
app.get("/api/auth/google/callback", async (req, res) => {
  console.log("➡️ GET /api/auth/google/callback called");

  const code = req.query.code;
  const redirect_uri = "http://localhost:5000/api/auth/google/callback";

  console.log("🔐 Authorization code received:", code);
  console.log("🌐 Redirect URI for token exchange:", redirect_uri);

  try {
    console.log("📡 Requesting tokens from Google...");

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri,
        grant_type: "authorization_code",
      }
    );

    console.log("✅ Token response received:", tokenResponse.data);

    const { access_token } = tokenResponse.data;
    console.log("🪪 Extracted access_token:", access_token);

    console.log("👤 Fetching user info from Google...");
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const user = userInfo.data;
    console.log("📥 User info received from Google:", user);

    console.log("🔎 Searching for existing user in DB...");
    let existingUser = await User.findOne({ where: { email: user.email } });

    if (!existingUser) {
      console.log("🆕 User not found. Creating new user...");

      existingUser = await User.create({
        googleId: user.sub,
        email: user.email,
        displayName: user.name,
        picture: user.picture,
      });

      console.log("✅ New user created and saved in DB:", existingUser.toJSON());
    } else {
      console.log("🔁 Existing user found in DB:", existingUser.toJSON());
    }

    console.log("🔑 Generating JWT...");
    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email },  
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ JWT generated:", token);

    const html = `
    <script>
    window.opener.postMessage({
    token: '${token}',
    type: 'auth'
    }, '*');
    window.close();
    </script>
    `;
    res.send(html);

  } catch (error) {
    console.error('Error during Google OAuth callback:', error);

    const errorMessage = 'An error occurred during authentication.';
    res.send(`
      <script>
        window.opener.postMessage({ error: '${errorMessage}' }, '*');
        window.close();
      </script>
    `);
  }
});

const callbackURL = "http://localhost:5000/auth/x/callback";

// Twitter OAuth Setup
console.log("📦 Setting up Twitter OAuth");
const oa = new OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  appKey,
  appSecret,
  "1.0A",
  callbackURL,
  "HMAC-SHA1"
);

const tempStore = {}; // Dev-only storage for request token secret

// Step 1: Redirect user to Twitter login
app.get("/auth/x", (req, res) => {
  console.log("➡️ Received request at /auth/x");

  oa.getOAuthRequestToken((err, oauth_token, oauth_token_secret) => {
    if (err) {
      console.error("❌ Error getting request token:", err);
      return res.status(500).send("Twitter login failed");
    }

    console.log("✅ Got request token:", { oauth_token, oauth_token_secret });

    tempStore[oauth_token] = oauth_token_secret;

    const redirectURL = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
    console.log("🔁 Redirecting user to Twitter login:", redirectURL);
    res.redirect(redirectURL);
  });
});

// Step 2: Twitter callback
app.get("/auth/x/callback", async (req, res) => {
  console.log("⬅️ Twitter redirected back to /auth/x/callback");
  const { oauth_token, oauth_verifier } = req.query;
  console.log("📥 Received query params:", { oauth_token, oauth_verifier });

  const oauth_token_secret = tempStore[oauth_token];

  if (!oauth_token_secret) {
    console.warn("⚠️ Missing oauth_token_secret for token:", oauth_token);
    return res.status(400).send("Session expired. Try again.");
  }

  oa.getOAuthAccessToken(
    oauth_token,
    oauth_token_secret,
    oauth_verifier,
    async (err, access_token, access_token_secret, result) => {
      if (err) {
        console.error("❌ Error exchanging token:", err);
        return res.status(500).send("Twitter login error");
      }

      console.log("✅ Access token obtained:", {
        access_token,
        access_token_secret,
        result,
      });

      let user = await User.findOne({ twitterId: result.user_id });
      if (!user) {
        console.log("🆕 Creating new user:", {
          twitterId: result.user_id,
          displayName: result.screen_name,
        });

        user = new User({
          twitterId: result.user_id,
          displayName: result.screen_name,
          twitterAccessToken: access_token,
          twitterAccessSecret: access_token_secret,
        });
        await user.save();
        console.log("💾 New user saved");
      } else {
        console.log("🔍 Found existing user:", user._id);
      }

      const token = jwt.sign(
        { id: user._id, twitterId: result.user_id },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      console.log("🔐 JWT issued for user:", token);

      res
        .cookie("token", token, { httpOnly: true })
        .redirect("http://localhost:3000/dashboard");
      console.log("✅ User authenticated and redirected to dashboard");
    }
  );
});



const authenticateToken = (req, res, next) => {
  console.log("Authenticating token...");

  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader);

  const token = authHeader && authHeader.split(" ")[1];
  console.log("Extracted token:", token);

  if (!token) {
    console.warn("No token provided");
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("Token verified. Decoded payload:", decoded);
    req.userId = decoded.id;
    next();
  });
};

app.get("/api/auth/validate", authenticateToken, async (req, res) => {
  console.log("Token validated. Fetching user with ID:", req.userId);

  try {
    const user = await User.findByPk(req.userId);
    console.log("User lookup result:", user);

    if (!user) {
      console.warn("User not found for ID:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found. Sending response...");
    res.json({
      email: user.email,
      name: user.displayName,
      photo: user.picture,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});




// API to create a post
app.post('/api/posts', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.userId; // Extracted from JWT in authenticateToken

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.create({
      title,
      content,
      userId,
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API to fetch posts for a specific user
app.get('/api/posts', authenticateToken, async (req, res) => {
  const userId = req.userId;

  try {
    const posts = await Post.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']], 
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'], 
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





app.listen(5000, () => console.log("✅ Server running on port 5000"));

// ///

