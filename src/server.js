const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "622209008591-677gjbfrj9222rbr07j4vsko40kod5pb.apps.googleusercontent.com",
);

app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "622209008591-677gjbfrj9222rbr07j4vsko40kod5pb.apps.googleusercontent.com", // Ganti 'YOUR_GOOGLE_CLIENT_ID'
    });
    const payload = ticket.getPayload();

    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ success: false, message: "Invalid Google Token" });
  }
});
