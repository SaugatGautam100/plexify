import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import Seller from "@/models/seller";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "user-credentials",
      name: "User Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "hidden", value: "user" }
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            userType: "user"
          };
        } catch (error) {
          console.error("Error during user authorization: ", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "seller-credentials", 
      name: "Seller Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "hidden", value: "seller" }
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const seller = await Seller.findOne({ email });

          if (!seller) {
            return null;
          }

          if (!seller.isActive) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, seller.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: seller._id.toString(),
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            businessName: seller.businessName,
            businessAddress: seller.businessAddress,
            description: seller.description,
            rating: seller.rating,
            totalSales: seller.totalSales,
            isVerified: seller.isVerified,
            userType: "seller"
          };
        } catch (error) {
          console.error("Error during seller authorization: ", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          await connectMongoDB();
          
          // Check if user exists in either User or Seller collection
          const existingUser = await User.findOne({ email: user.email });
          const existingSeller = await Seller.findOne({ email: user.email });
          
          if (!existingUser && !existingSeller) {
            // Create new user account by default for social login
            await User.create({
              name: user.name,
              email: user.email,
              phone: "", // Will be filled later
              address: "", // Will be filled later
              password: "", // No password for social login
            });
            
            // Set user type for the session
            user.userType = "user";
          } else if (existingUser) {
            user.userType = "user";
            user.phone = existingUser.phone;
            user.address = existingUser.address;
          } else if (existingSeller) {
            user.userType = "seller";
            user.phone = existingSeller.phone;
            user.businessName = existingSeller.businessName;
            user.businessAddress = existingSeller.businessAddress;
            user.description = existingSeller.description;
            user.rating = existingSeller.rating;
            user.totalSales = existingSeller.totalSales;
            user.isVerified = existingSeller.isVerified;
          }
        } catch (error) {
          console.error("Error during social sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.name = user.name;
        token.email = user.email;
        
        if (user.userType === "user") {
          token.phone = user.phone;
          token.address = user.address;
        } else if (user.userType === "seller") {
          token.phone = user.phone;
          token.businessName = user.businessName;
          token.businessAddress = user.businessAddress;
          token.description = user.description;
          token.rating = user.rating;
          token.totalSales = user.totalSales;
          token.isVerified = user.isVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
        session.user.userType = token.userType;
        session.user.name = token.name;
        session.user.email = token.email;
        
        if (token.userType === "user") {
          session.user.phone = token.phone;
          session.user.address = token.address;
        } else if (token.userType === "seller") {
          session.user.phone = token.phone;
          session.user.businessName = token.businessName;
          session.user.businessAddress = token.businessAddress;
          session.user.description = token.description;
          session.user.rating = token.rating;
          session.user.totalSales = token.totalSales;
          session.user.isVerified = token.isVerified;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };