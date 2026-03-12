const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));


// -------------------------
// MongoDB Connection
// -------------------------
mongoose.connect("mongodb://127.0.0.1:27017/restaurantDB")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));


// -------------------------
// Booking Schema
// -------------------------
const bookingSchema = new mongoose.Schema({

  reservationId: String,   // NEW FIELD

  name: String,
  mobile: String,
  email: String,
  date: String,
  time: String,
  guests: Number,
  tableNumber: String,
  amount: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Booking = mongoose.model("Booking", bookingSchema);


// -------------------------
// SAVE BOOKING
// (Prevent Double Booking)
// -------------------------
app.post("/api/book", async (req, res) => {

  try {

    const { date, time, tableNumber } = req.body;

    // Check if same table already booked
    const existingBooking = await Booking.findOne({
      date: date,
      time: time,
      tableNumber: tableNumber
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "❌ Table already booked for this date and time"
      });
    }

    // COUNT BOOKINGS
    const count = await Booking.countDocuments();

    // CREATE RESERVATION ID
    const reservationId = "RES-" + (1001 + count);

    const booking = new Booking({
      ...req.body,
      reservationId: reservationId
    });

    await booking.save();

    res.status(201).json({
      message: "✅ Booking saved successfully",
      booking
    });

  } catch (error) {

    res.status(500).json({
      message: "Error saving booking",
      error
    });

  }

});


// -------------------------
// GET ALL BOOKINGS
// (Admin Dashboard)
// -------------------------
app.get("/api/bookings", async (req, res) => {

  try {

    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching bookings"
    });

  }

});


// -------------------------
// DELETE BOOKING
// -------------------------
app.delete("/api/bookings/:id", async (req, res) => {

  try {

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      message: "Booking deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting booking"
    });

  }

});


// -------------------------
// GET BOOKED TABLES
// -------------------------
app.get("/api/booked-tables", async (req, res) => {

  try {

    const { date, time } = req.query;

    const bookings = await Booking.find({
      date: date,
      time: time
    });

    const tables = bookings.map(b => b.tableNumber);

    res.json(tables);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching booked tables"
    });

  }

});


// -------------------------
// START SERVER
// -------------------------
app.listen(PORT, () => {

  console.log(`🚀 Server running at http://localhost:${PORT}`);

});