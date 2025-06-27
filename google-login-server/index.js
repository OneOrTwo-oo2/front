// ✅ Google OAuth를 위한 Node.js + Express 백엔드 서버 코드

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// ✅ CORS 설정 (React와 통신 가능하도록)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ✅ 세션 설정
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ 사용자 직렬화/역직렬화
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ✅ Google OAuth 전략 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// ✅ 로그인 요청 경로
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ 콜백 처리 경로
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:3000/main',
    failureRedirect: '/'  // 로그인 실패 시 루트로
  })
);

// ✅ 현재 로그인한 유저 정보 확인
app.get('/auth/user', (req, res) => {
  res.send(req.user);
});

// ✅ 로그아웃
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// ✅ 서버 실행
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
