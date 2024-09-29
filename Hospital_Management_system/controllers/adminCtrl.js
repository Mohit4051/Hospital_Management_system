const doctorModel =require('../models/doctorModel');
const userModel =require('../models/userModels');


const getAllUsersController = async (req, res) => {
    try {
        const users = await userModel.find({}); // Use a different variable name here
        res.setHeader('Cache-Control', 'no-store'); // Disable caching
        res.status(200).send({
            success: true,
            message: "Users data list",
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while fetching users",
            error,
        });
    }
};


const getAllDoctorsController =async(req,res)=>{
    try{
        const doctors=await doctorModel.find({});
        res.setHeader('Cache-Control', 'no-store'); // Disable caching
        res.status(200).send({
            success:true,
            message:"Doctor data list",
            data:doctors,
        });

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error while fetching Doctors",
            error,
        });
    }
};

// DOCTOR ACCOUNT STATUS
const changeAccountStatusController = async (req, res) => {
    try {
        const { doctorId, status } = req.body;
        const doctor = await doctorModel.findByIdAndUpdate(doctorId,{status});

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found",
            });
        }

        const user = await userModel.findOne({ _id: doctor.userId });
        const notification = user.notification;
        notification.push({
            type: "doctor-account-request-updated",
            message: `Your Doctor Account Request has ${status}`,
            onclickPath: '/notification',
        });

        user.isDoctor = status === "approved" ? true:false;
        await user.save();

        res.status(201).send({
            success: true,
            message: "Account Status Updated",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Account Status",
            error,
        });
    }
};



module.exports ={getAllDoctorsController,getAllUsersController,changeAccountStatusController};