const express = require('express'); 
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config(); 

const userRoutes = require('./Routes/userRoutes');
const driverRoutes = require('./Routes/driverRoutes');
const busRoutes = require('./Routes/busRoutes');
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const User = require('./Models/UserModel');
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const io = new Server(server, {
  cors: { 
    origin: ["http://localhost:4000", "https://track-my-bus-v2-bgfk.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true     
  }
});


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:4000", "https://track-my-bus-v2-bgfk.vercel.app/"],
  methods: ["GET", "POST","PUT", "DELETE"],
  credentials: true     
}));



app.use('/user', userRoutes);
app.use('/driver', driverRoutes);
app.use('/bus', busRoutes);

app.post("/send-multiple", async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    const user = await User.findById(userId);
    const tokens = user.fcmTokens;
    const message = {
      notification: { title, body },
      tokens, 
    };
  const response = await admin.messaging().sendEachForMulticast(message);
  console.log("FCM response:", response);
   response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        user.fcmTokens.splice(idx, 1); 
      }
    });
  res.json({ success: true, response });
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



app.post('/api/ors/route', async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || coordinates.length < 2) {
      return res.status(400).json({ message: 'At least two coordinates are required.' });
    }

    const orsApiKey = process.env.ORS_API_KEY;
    if (!orsApiKey) {
      throw new Error("Openrouteservice API key is missing.");
    }
    
    console.log("Proxying request to Openrouteservice...");
    
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      { coordinates: coordinates }, 
      {
        headers: {
          'Authorization': orsApiKey, 
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data); 

  } catch (error) {
    console.error('Error in ORS proxy:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch route from Openrouteservice' });
  }
});



io.on('connection', (socket) => {
  console.log('connected', socket.id);

  socket.on('join_room', (busId) => {
    socket.join(busId);
    console.log(`User ${socket.id} joined room ${busId}`);
  });

  socket.on('sendInfo', (information) => {
    let { name, busId, lat, lng } = information;
    console.log("Received info:", information);

    lat = Number(lat);
    lng = Number(lng);

    if (!busId || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.log("Invalid payload received:", information);
      return;
    }

    io.to(busId).emit('receiveInfo', { name, busId, lat, lng });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const URI = process.env.MONGODB_URI;
mongoose.connect(URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log("MongoDB error:-" + err));