import { Router } from "express";
import { login, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
// router.route("/add_to_activity").post(verifyJWT, addToActivity);
// router.route("/get_all_activity").get(verifyJWT, getAllActivity);

export default router;