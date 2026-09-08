import { Router } from "express";

import { signup } from "../../controllers/auth/signup.js";

export const signupRouter = Router();

signupRouter.post("/signup", signup);
