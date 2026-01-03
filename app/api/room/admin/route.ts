
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
            where: { adminId: userId },
            select: {
                id: true,
                link: true,
                created_at: true,
                slug: true
            }
        })

        return NextResponse.json({ adminRooms: rooms }, { status: 200 })
    } catch (err) {
        console.log("Server error. Could not find room.");
        return NextResponse.json({ message: "Server error. Could not find room." }, { status: 500 });
    }
}
