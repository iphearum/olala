import NextAuth from "next-auth";
import { authOptions } from "@/app/api/server/auth";

export default NextAuth(authOptions);
