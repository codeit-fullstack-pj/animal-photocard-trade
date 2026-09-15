import { ACCESS_TOKEN_COOKIE } from "../lib/auth-cookies.js";
import * as userService from "../services/user.service.js";

export async function me(req, res) {
  const bearer = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const user = await userService.getCurrentUser(bearer || req.cookies[ACCESS_TOKEN_COOKIE]);
  res.json({ data: { user } });
}
