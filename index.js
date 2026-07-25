const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


let bookingsData = [];
let favoritesData = [];
let applicationsData = [];


const classesData = [
  {
    _id: "1",
    name: "Hypertrophy Strength Workout",
    category: "Gym",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500",
    details: "Build solid muscle mass and level up your core strength with our professional powerlifting and bodybuilding architecture.",
    price: 3500
  },
  {
    _id: "2",
    name: "Vinyasa Flow Yoga",
    category: "Yoga",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=500",
    details: "Connect your body and mind through standard Vinyasa movements. Perfect for flexibility, peace, and mental core balance.",
    price: 2000
  },
  {
    _id: "3",
    name: "HIIT Cardio Blast",
    category: "Cardio",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=500",
    details: "Burn maximum calories in minimum time. Intense cardiovascular drills designed by experts to shred extra fat.",
    price: 1800
  },
  {
    _id: "4",
    name: "Power CrossFit Session",
    category: "Gym",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=500",
    details: "High-intensity functional movements including lifting, sprinting, and jumping. Test your absolute limits.",
    price: 4000
  },
  {
    _id: "5",
    name: "Ashtanga Yoga Core",
    category: "Yoga",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500",
    details: "Synchronizing breath with a progressive series of postures. Great for internal cleansing and stamina.",
    price: 2500
  }
];


app.get('/featured-classes', (req, res) => {
  const result = classesData.slice(0, 3);
  res.send(result);
});


app.get('/classes', (req, res) => {
  try {
    const search = req.query.search || '';
    let category = req.query.category || 'All';

    if (category.includes(':')) {
      category = category.split(':')[0];
    }

    let filteredClasses = classesData;

    if (search) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== 'All') {
      filteredClasses = filteredClasses.filter(cls => 
        cls.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.send(filteredClasses);
  } catch (error) {
    console.error("Error on local filtering:", error);
    res.send([]);
  }
});


app.get('/classes/:id', (req, res) => {
  try {
    const id = req.params.id;
    const singleClass = classesData.find(cls => cls._id === id);
    
    if (singleClass) {
      res.send(singleClass);
    } else {
      res.status(404).send({ message: "Class not found" });
    }
  } catch (error) {
    console.error("Error fetching single class details:", error);
    res.status(500).send({ message: "Server error" });
  }
});


app.post('/bookings', (req, res) => {
  try {
    const booking = req.body;
    const newBooking = { _id: Date.now().toString(), ...booking };
    bookingsData.push(newBooking);
    console.log("Class Booked Successfully:", newBooking);
    res.status(201).send({ insertedId: newBooking._id, acknowledged: true });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).send({ message: "Failed to book class" });
  }
});


app.get('/bookings', (req, res) => {
  try {
    const email = req.query.email;
    if (email) {
      const userBookings = bookingsData.filter(item => item.userEmail === email);
      return res.send(userBookings);
    }
    res.send(bookingsData);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).send({ message: "Failed to fetch bookings" });
  }
});


app.post('/favorites', (req, res) => {
  try {
    const favorite = req.body;

    
    const existing = favoritesData.find(
      fav => fav.userEmail === favorite.userEmail && String(fav.classId) === String(favorite.classId)
    );

    if (existing) {
      return res.status(400).send({ message: "Already in favorites!" });
    }

    const newFavorite = { _id: Date.now().toString(), ...favorite };
    favoritesData.push(newFavorite);

    console.log("Favorite Added Successfully:", newFavorite);
    res.status(201).send({ insertedId: newFavorite._id, acknowledged: true });
  } catch (error) {
    console.error("Favorite Error:", error);
    res.status(500).send({ message: "Failed to add favorite" });
  }
});


app.get('/favorites', (req, res) => {
  try {
    const email = req.query.email;
    if (email) {
      const userFavorites = favoritesData.filter(item => item.userEmail === email);
      return res.send(userFavorites);
    }
    res.send(favoritesData);
  } catch (error) {
    console.error("Fetch Favorites Error:", error);
    res.status(500).send({ message: "Failed to fetch favorites" });
  }
});


app.delete('/favorites/:id', (req, res) => {
  try {
    const id = req.params.id;
    favoritesData = favoritesData.filter(item => item._id !== id);
    res.send({ deletedCount: 1, acknowledged: true });
  } catch (error) {
    console.error("Delete Favorite Error:", error);
    res.status(500).send({ message: "Failed to delete favorite" });
  }
});


app.post('/apply-trainer', (req, res) => {
  try {
    const application = req.body;
    
    
    const userEmail = application.userEmail || application.email;
    const existing = applicationsData.find(
      app => (app.userEmail === userEmail || app.email === userEmail)
    );

    if (existing) {
      return res.status(400).send({ message: "You have already applied to be a trainer!" });
    }

    const newApplication = { 
      _id: Date.now().toString(), 
      status: 'Pending', 
      appliedDate: new Date().toISOString().split('T')[0],
      ...application 
    };
    
    applicationsData.push(newApplication);
    console.log("Trainer Application Received:", newApplication);
    res.status(201).send({ insertedId: newApplication._id, acknowledged: true });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).send({ message: "Failed to submit application" });
  }
});


app.get('/user-stats', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).send({ message: "Email is required" });

    const bookedCount = bookingsData.filter(item => item.userEmail === email).length;
    const favoriteCount = favoritesData.filter(item => item.userEmail === email).length;

    res.send({ bookedCount, favoriteCount });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).send({ message: "Failed to fetch stats" });
  }
});


app.get('/', (req, res) => {
  res.send('IronPulse Local Standalone Server is running perfectly!');
});


app.listen(port, () => {
  console.log(`Successfully running locally! Server is running on port: ${port}`);
});