const express = require('express')
const passport = require('passport')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require('dotenv').config()

const app = express()
app.use(passport.initialize())
app.use(express.static("public"))

const {CLIENT_ID , CLIENT_SECRET} = process.env

passport.use(
    new GoogleStrategy(
    {
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3001/callback",
    },
    (accessToken, refreshToken, profile, next) => {
    console.log("Access token", accessToken);
    console.log("Profile", profile);
    next(null, profile);
    }
    )
);

let user;

app.get("/", (req, res) => {
    res.send(`<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OAuth Login</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <main class="card">
        <h1>Welcome</h1>
        <p>Sign in to continue</p>
        <a class="login-button" href="/login">Login with Google</a>
    </main>
</body>
</html>`);
});

app.get(
    "/login",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/callback",
    passport.authenticate("google", {
    failureRedirect: "/failure",
    session: false,
    }),
    (req, res) => {
    user = req.user;
    res.redirect("/profile");
}
);
app.get("/profile", (req, res) => {
    if (!user) {
        return res.redirect("/");
    }

    const photo = user.photos?.[0]?.value;
    const email = user.emails?.[0]?.value;

    res.send(`<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Profile</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <main class="card profile-card">
        ${photo ? `<img class="avatar" src="${photo}" alt="">` : ""}
        <h1>${user.displayName || "User"}</h1>
        ${email ? `<p>${email}</p>` : ""}
        <a class="logout-button" href="/">Back</a>
    </main>
</body>
</html>`);
});

app.listen(3001 ,() => {
    console.log("Server is running on port 3001")
})