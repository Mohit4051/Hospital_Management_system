const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const doctorModel =require("../models/doctorModel");
const appointmentModel=require('../models/appointmentModel');
const moment=require("moment");



// import { updateUser } from "../redux/actions/userActions";
 //import { useDispatch } from "react-redux";

// Register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(200).send({ message: `User Already Exists`, success: false });
    }

    const { name, email, password } = req.body;

    // Validate that "name" is provided
    if (!name) {
      return res.status(400).send({ message: 'Name is required', success: false });
    }

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //req.body.password=hashedPassword;

    // Use the hashed password when creating the user instance
    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: `Register Controller ${error.message}` });
  }
};

const loginController = async(req,res) => {
    try{
        const user=await userModel.findOne({email:req.body.email});
        if(!user){
            return res.status(200).send({message:'user not found',success:false});
        }
        const isMatch =await bcrypt.compare(req.body.password, user.password);

        if(!isMatch){
            return res.status(200).send({message:'Invalid Email or Password',success:false});
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});


        // const dispatch=useDispatch();
        // dispatch(updateUser(user));


        res.status(200).send({message:"Login Success",success:true,token});
    }catch(error){
        console.log(error);
        res.status(500).send({message:`Error in Login CTRL ${error.message}`});

    }
};

const authController =async(req,res)=>{
  try{
    const user=await userModel.findById({_id:req.body.userId});
    user.password=undefined;
    if(!user){
      return res.status(200).send({
        message:"User not Found",
        success:false,
      });
    }else{
      res.status(200).send({
        success:true,
        data:user,
      });
    }
    

  }catch(error){
    console.log(error);
    res.status(500).send({
      message:"auth error",
      success:false,
      error,
    });

  }
};

//Apply Doctor Ctrl

const applyDoctorController =async(req,res)=>{
  try{
    const newDoctor= await doctorModel({...req.body,status:'pending'})
    await newDoctor.save();
    const adminUser =await userModel.findOne({isAdmin:true});
    const notification =adminUser.notification;
    notification.push({
      type:'apply-doctor-request',
      message:`${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor Account`,
      data:{
        doctorId:newDoctor._id,
        name:newDoctor.firstName +" " +newDoctor.lastName,
        onClickPath:'/admin/doctors',

      },
    });

    await userModel.findByIdAndUpdate(adminUser._id,{notification});
    res.status(201).send({
      success:true,
      message:"Doctor Account Applied Succesfully",
    });

  }catch(error){
    console.log(error);
    res.status(500).send({
      success:false,
      error,
      message:'Error while applying for doctor'
    })
  }
};


// notification ctrl

const getAllNotificationController =async(req,res) =>{
  try{
    const user =await userModel.findOne({_id:req.body.userId});
    const seennotification =user.seennotification;
    const notification =user.notification;
    seennotification.push(...notification);

    // Log the seennotification array before sending the response
    console.log("Seen Notifications:", seennotification);


    user.notification=[];
    user.seennotification =seennotification;
    
    const updatedUser =await user.save();
   
    // Log the updatedUser before sending the response
    console.log("Updated User:", updatedUser);

    
    res.status(200).send({
      success:true,
      message:'All notifications are read',
      data:updatedUser,

    });
  }catch(error){
    console.log(error);
    res.status(500).send({
      message:'Error in notification',
      success:false,
      error
    })
  }
};

//delete all notifications

const deleteAllNotificationController =async(req,res) =>{
  try{
    const user =await userModel.findOne({_id:req.body.userId});
    user.notification=[];
    user.seennotification=[];
    const updatedUser =await user.save();
    updatedUser.password =undefined;
    res.status(200).send({
      success:true,
      message:"Notifications Deleted Succesfully",
      data:updatedUser,

    })


  }catch(error){
    console.log(error);
    res.status(500).send({
      success:false,
      message:"Unable To Delete",
      error,
    });
  }
};

//GET ALL DOC 
const getAllDoctorsController =async(req,res)=>{
  try{
    const doctors=await doctorModel.find({status:"approved"});
    res.status(200).send({
      success:true,
      message:"Doctor list fetched succesfully",
      data:doctors,
    });

  }catch(error){
    console.log(error);
    res.status(500).send({
      success:false,
      error,
      message:"Error while fetching Doctor"
    });
  }
};


//BOOK APPOINTMENT 

const bookAppointmentController =async(req,res)=>{
  try{
    // console.log('Received Date:', req.body.date);
    // console.log('Received Time:', req.body.time);

    req.body.date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
    req.body.time = moment(req.body.time, 'HH:mm').toISOString();

    // console.log('Converted Date:', req.body.date);
    // console.log('Converted Time:', req.body.time);


    req.body.status = "pending";
    const newAppointment =new appointmentModel(req.body);
    await newAppointment.save();
    const user =await userModel.findOne({ _id:req.body.doctorInfo.userId});
    user.notification.push({
      type:"New-appointment-request",
      message:`A new appointment request from ${req.body.userInfo.name}`,
      onClickPath:"/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success:true,
      message:"Appointment Booked Succesfully",
    });

  }catch(error){
    console.log(error);
    res.status(500).send({
      success:false,
      error,
      message:'Error while Booking Appointment'
    })

  }
};

//booking avalability

const bookingAvailabilityController=async(req,res) =>{
  try{
    const date=moment(req.body.date,'DD-MM-YYYY').toISOString();
    const fromTime =moment(req.body.time,'HH:mm').subtract(1,'hours').toISOString();
    const toTime =moment(req.body.time,'HH:mm').add(1,'hours').toISOString();
    const doctorId=req.body.doctorId;
    const appointments =await appointmentModel.find({
      doctorId,
      date,
      time:{
        $gte:fromTime ,
        $lte:toTime,
      },
    });
    if(appointments.length> 0){
      return res.status(200).send({
        message:"Appointment not available at this time",
        success:true,
      });
    }else{
      return res.status(200).send({
        success:true,
        message:"Appointment available",
      });
    }


  }catch(error){
    console.log(error);
    res.status(500).send({
      success:false,
      error,
      message:"Error in Booking"
    })
  }
};


const userAppointmentsController = async(req,res) =>{
  try{
    const appointments =await  appointmentModel.find({
      userId:req.body.userId,
    });
    res.status(200).send({
      success:true,
      message:"User Appointment fetched Successfully",
      data:appointments,
    });

  }catch(error){
    console.log(error);
    res.status(500).send({
      success:false,
      error,
      message:'Error in User Appointment'
    })
  }
};




module.exports = { loginController, 
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController
};
