const express = require('express');
const cors = require('cors');

const vehicleRoutes = require('./routes/vehicleRoutes');
const positionRoutes = require('./routes/positionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));