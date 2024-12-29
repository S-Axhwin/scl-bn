import { Context } from "hono"
import { getCookie } from "hono/cookie";

export const adminMiddle = async(c:Context, next:any) => {
    const token = getCookie(c, "token");
    console.log(token);
    await next();
}