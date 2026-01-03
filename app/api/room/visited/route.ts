
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "@/lib/prismaClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ message: "No userId recieved." }, { status: 404 });
    }

    try {
        const rooms = await prismaClient.room.findMany({
            where: {
                user: {
                    some: { id: userId }
                }, NOT: {
                    adminId: userId,
                }
            }
        })

        return NextResponse.json({ visitedRooms: rooms }, { status: 200 })
    } catch (err) {
        console.log("Server error. Could not fetch.");
        return NextResponse.json({ message: "Server error. Could not fetch." }, { status: 500 });
    }
}
