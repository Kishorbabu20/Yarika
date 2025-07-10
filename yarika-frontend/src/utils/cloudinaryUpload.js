// utils/cloudinaryUpload.js
import axios from "axios";

export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("AddProduct"); 
  data.append("da1kmr54w"); 

  try {
    const res = await axios.post("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", data);
    return res.data.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};