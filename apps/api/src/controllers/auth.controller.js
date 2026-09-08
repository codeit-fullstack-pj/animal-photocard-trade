import { validateSignupBody } from "../lib/validation.js";
import * as authService from "../services/auth.service.js";

export async function signup(req, res) {
  const body = validateSignupBody(req.body);
  const user = await authService.signup(body);
  res.status(201).json({ data: { user } });
}
