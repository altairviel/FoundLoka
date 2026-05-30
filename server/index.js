const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./src/config/db');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173', //5173 untuk vite react
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/authRoutes'));
// app.use('/api/users', require('./src/routes/userRoutes'));
// app.use('/api/campaigns', require('./src/routes/campaignRoutes'));
// app.use('/api/investments', require('./src/routes/investmentRoutes'));
// app.use('/api/payments', require('./src/routes/paymentRoutes'));
// app.use('/api/installments', require('./src/routes/installmentRoutes'));
// app.use('/api/notifications', require('./src/routes/notificationRoutes'));
// app.use('/api/reviews', require('./src/routes/reviewRoutes'));
// app.use('/api/admin', require('./src/routes/adminRoutes'));

//testing route
app.get('/', (req, res) => {
  res.json({ message: 'tesss' });
});

//port env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
