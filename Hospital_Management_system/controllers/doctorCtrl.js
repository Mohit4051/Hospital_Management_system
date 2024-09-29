const moment = require("moment");
const doctorModel =require("../models/doctorModel");
const appointmentModel=require("../models/appointmentModel");
const userModel = require("../models/userModels");
const getDoctorInfoController =async(req,res) =>{
    try{
        const doctor= await doctorModel.findOne({userId:req.body.userId});
        res.status(200).send({
            success:true,
            message:"Doctor data fetch success",
            data:doctor,
        });
        

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in fetching doctor details"
        });

    }
}



const updateProfileController = async (req, res) => {
    try {
        // Convert the timings array of moment objects to an array of formatted strings
        const formattedTimings = req.body.timings.map((time) => moment(time).format("HH:mm"));

        // Update the doctor's profile with the formatted timings
        const doctor = await doctorModel.findOneAndUpdate(
            { userId: req.body.userId },
            { ...req.body, timings: formattedTimings },
            { new: true }
        );

        res.status(200).send({
            success: true,
            message: "Doctor Profile Updated",
            data: doctor,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Doctor Profile update issue",
            error,
        });
    }
};



   // get single doctor
const getDoctorByIdController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ _id: req.body.doctorId });

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Single Doc info fetched",
            data: doctor,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in single doctor info",
        });
    }
};


const doctorAppointmentsController =async(req,res) =>{
    try{
        const doctor =await doctorModel.findOne({userId:req.body.userId});
        const appointments =await appointmentModel.find({
            doctorId: doctor._id,
        });
        res.status(200).send({
            success:true,
            message:"Doctor Appointment fetch Successfully",
            data:appointments,
        });
        


    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Doc Appointments"
        })
    }
};


const updateStatusController=async(req,res) =>{
    try{
        const {appointmentsId,status} =req.body
        const appointments =await appointmentModel.findByIdAndUpdate(appointmentsId,{status})
        const user =await userModel.findOne({ _id: appointments.userId});
        const notification =user.notification;

        notification.push({
          type:"status-updated",
          message:`Your Appointment has been updated ${status}`,
          onClickPath:"/doctor-appointments",
        });
        await user.save();
        res.status(200).send({
            success:true,
            message:"Appointment Status Updated",
        });

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in update status"
        })
    }
};


module.exports ={getDoctorInfoController,updateProfileController,getDoctorByIdController,doctorAppointmentsController,updateStatusController};