"use client"


import { useSession, signIn, signOut } from "next-auth/react";

export default function Test() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div>
        <p>Signed in as: {session.user?.email}</p>
        <button onClick={() => signOut()}>signOut</button>
      </div>

    )
  }

  return (
    <div>
      <p> Not signed in</p>
      <button onClick={() => signIn()}>signin</button>
    </div>
  )

}
