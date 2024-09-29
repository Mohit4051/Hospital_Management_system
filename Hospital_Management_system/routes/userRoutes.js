// userRoutes.js or a similar file where you configure your routes
const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  
} = require("../controllers/userCtrl");

const authMiddleware = require("../middlewares/authMiddleware");
const { getAllDoctorsController } = require("../controllers/adminCtrl");
//const authController = require("../controllers/authController");

const router = express.Router();

// LOGIN || POST
router.post("/login", loginController);

// REGISTER || POST
router.post("/register", registerController);

// Auth || POST
router.post("/getUserData", authMiddleware, authController);

// Apply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);


// Notification Doctor || POST
router.post("/get-all-notification", authMiddleware, getAllNotificationController);


router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);

//GET ALL DOCTOR
router.get('/getAllDoctors',authMiddleware,getAllDoctorsController);

//BOOK APPOINTMENTS
router.post('/book-appointment',authMiddleware,bookAppointmentController);

//Booking availability
router.post('/booking-availability',authMiddleware,bookingAvailabilityController);

//Appointment list
router.get('/user-appointments',authMiddleware,userAppointmentsController)

module.exports = router;
