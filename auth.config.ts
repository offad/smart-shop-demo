import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
	secret: process.env.AUTH_SECRET,
    pages: {
      	signIn: '/login',
		newUser: '/signup'
    },
    callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user
			return true
		},

		async jwt({ token, user }) {
			if (user) {
			  token = { ...token, id: user.id }
			}
	  
			return token
		},

		async session({ session, token }) {
			if (token) {
			  const { id } = token as { id: string }
			  const { user } = session
	  
			  session = { ...session, user: { ...user, id } }
			}
	  
			return session
		}
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;