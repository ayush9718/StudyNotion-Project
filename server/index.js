const express = require("express");

const app = express();

const Course = require("./models/Course");
const User = require("./models/User");
const Category = require("./models/Category");
const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");
const CourseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 5000;
database.connect();

app.use(express.json());
app.use(cookieParser());

const whitelist = process.env.CORS_ORIGIN
  ? JSON.parse(process.env.CORS_ORIGIN)
  : ["*"];

app.use(
  cors({
    origin: whitelist,
    credentials: true,
    maxAge: 14400,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudnairyconnect();

app.use("/api/v1/auth", userRoutes);

app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v1/profile", profileRoutes);

app.use("/api/v1/course", CourseRoutes);

app.use("/api/v1/contact", require("./routes/ContactUs"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// ----------------------------------------function to add a category as a admin--------------------------------------- //

const categoryName = "";
const categoryDiscription = "";
createCategoryIfNotExists(categoryName,categoryDiscription);

const createCategoryIfNotExists = async (categoryName,categoryDiscription) => { 
  try{
    if(!categoryName || !categoryDiscription){
      console.log("required all feilds");
      return ;
    }
    
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      category = await Category.create({
        name: categoryName,
        description: categoryDiscription,
      });
      console.log("Category created");
    } else {
      console.log("Category already exists");
    }
  }
  catch(err){
    console.log("error while creating category");
    console.error(err);
  }
};




// ------------------------------function to add a course into a student list without payment---------------------------------- //

const courseid ="";
const studentid = "";
// addInaCourse(courseid,studentid);

const addInaCourse = async(courseid, studentid)=>{
  try{ 
    const course = await Course.findById(courseid);
    if(!course){
      console.log("course ki id galt hai");
      return ;
    }
    console.log("course shi hai id mil gayi");

    if(course.studentsEnrolled.includes(studentid)){
      console.log ("already enrolled");
      return ;
    }
    const student = await User.findByIdAndUpdate(
      studentid,
      {
        $push: {
          courses: course._id,
        },
      },
      { new: true }
    )
    console.log("student mein push kr diya hai");

    course.studentsEnrolled.push(student._id);
    await course.save();
    console.log("course mein push ho gya hai");
  }
  catch{
    console.log("gadbad hai add krne mein");
  }
}
