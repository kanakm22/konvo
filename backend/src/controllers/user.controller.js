import httpStatus from "http-status"
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { History } from "../models/history.model.js";
import { useNavigate } from "react-router-dom";

const routeTo = useNavigate();


const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ "message": "Please Provide credentials" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ "message": "User not Found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      let token = crypto.randomBytes(20).toString("hex");

      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({ token: token });
    } else {
      return res.status(401).json({ "message": "Invalid Username or Password" });
    }

  } catch (e) {
    return res.status(500).json({ "message": "Something went Wrong!" });
  }
}

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const exsistingUser = await User.findOne({ username });
    if (exsistingUser) {
      return res.status(httpStatus.FOUND).json({ "message": "User already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword
    })

    await newUser.save();

    res.status(httpStatus.CREATED).json({ "message": "User Registered" });
    
  } catch (e) {
    res.status(500).json({ "message": `Something went Wrong! ${e}` });
  }
}

export const getUserHistory = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const meetings = await History.find({ username: user.username });
    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
}

const addToHistory = async (req, res) => {
  try {
    const { token, meeting_code } = req.body;

    console.log("BACKEND RECEIVED DATA:", req.body);

    const user = await User.findOne({ token: token });

    console.log("USER SEARCH RESULT:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newHistory = new History({
      username: user.username,
      meetingCode: meeting_code
    });

    await newHistory.save();

    console.log("SAVED TO MONGODB SUCCESSFULLY");
    return res.status(200).json({ message: "History saved" });

  } catch (err) {
    console.log("BACKEND CRASHED:", err);
    return res.status(500).json({ message: "Error saving history" });
  }
}

export { login, register, getUserHistory, addToHistory };