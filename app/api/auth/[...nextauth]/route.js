import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null; // User not found
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null; // Passwords do not match
          }

          return user;
        } catch (error) {
          console.error("Error during authorization: ", error); // Use console.error for errors
          return null; // Return null on error
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  // Add callbacks to pass custom data to the session
  callbacks: {
    async jwt({ token, user }) {
      // 'user' is the object returned from the 'authorize' function above,
      // it's only available on initial sign-in.
      if (user) {
        token.id = user.id;
        token.phoneNumber = user.phoneNumber;
        token.address = user.address;
        // Add other fields you returned from authorize here
        token.name = user.name; // Ensure name is also passed if not default
        token.email = user.email; // Ensure email is also passed if not default
      }
      return token;
    },
    async session({ session, token }) {
      // The 'session' object is what gets returned by useSession() on the client.
      // We populate it with data from the 'token'.
      if (token.id) {
        session.user.id = token.id;
      }
      
      if (token.phoneNumber) {
        session.user.phoneNumber = token.phoneNumber;
      }
      if (token.address) {
        session.user.address = token.address;
      }
      // NextAuth usually populates session.user.name and .email automatically
      // if they are present in the token. But explicitly ensuring them
      // here doesn't hurt and clarifies intent.
      if (token.name) {
        session.user.name = token.name;
      }
      if (token.email) {
        session.user.email = token.email;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
