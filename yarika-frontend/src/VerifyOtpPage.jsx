// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const VerifyOtpPage = () => {
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState("");
//   const [serverOtp, setServerOtp] = useState("");
//   const [step, setStep] = useState(1);
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const sendOtp = async (e) => {
//     e.preventDefault();
//     const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
//     setServerOtp(generatedOtp);

//     try {
//       const res = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
//         headers: {
//           authorization: "4zbeFNmHhq9NIySo9nfo3odO1cVTMQ1k4jYrfIrqGv5rnfu6tuGUEdAgL0E4", // replace with your key
//         },
//         params: {
//           variables_values: generatedOtp,
//           route: "otp",
//           numbers: mobile,
//         },
//       });

//       console.log("OTP sent ", res.data);
//       setStep(2);
//     } catch (err) {
//       console.error("Failed to send OTP:", err.response?.data || err.message);
//       setMessage("Failed to send OTP. Check number or API key.");
//     }
//   };

//   const verifyOtp = (e) => {
//     e.preventDefault();
//     if (otp === serverOtp) {
//       const token = localStorage.getItem("tempToken");
//       localStorage.setItem("token", token);
//       localStorage.removeItem("tempToken");
//       navigate("/admin-dashboard"); // change if needed
//     } else {
//       setMessage("Incorrect OTP");
//     }
//   };

//   return (
//     <div className="admin-login-bg">
//       <form className="admin-login-box" onSubmit={step === 1 ? sendOtp : verifyOtp}>
//         <h2>OTP Verification</h2>

//         {step === 1 && (
//           <>
//             <input
//               type="text"
//               placeholder="Enter mobile number"
//               value={mobile}
//               onChange={(e) => setMobile(e.target.value)}
//               required
//             />
//             <button type="submit">Send OTP</button>
//           </>
//         )}

//         {step === 2 && (
//           <>
//             <input
//               type="text"
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//             <button type="submit">Verify OTP</button>
//           </>
//         )}

//         {message && <p className="error">{message}</p>}
//       </form>
//     </div>
//   );
// };

// export default VerifyOtpPage;
