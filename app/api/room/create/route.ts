
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { hashFunction } from "@/lib/utils";

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ message: "No userId recieved." }, { status: 404 });
    }

    try {
        const body = await req.json();
        const { slug } = body;
        
        const room = await prismaClient.room.create({
            data: {
                slug,
                admin: { connect: { id: userId } }
            }
        })

        if (!room) {
            return NextResponse.json({ message: "Error creaing room" }, { status: 402 });
        }

        const link = hashFunction();

        const generatedLink = await prismaClient.link.create({
            data: {
                link,
                room: { connect: { id: room.id } }
            }
        })
        if (!generatedLink) {
             return NextResponse.json({ message: "Error saving the link." }, { status: 402 });
        }

        return NextResponse.json({
            message: "Room created!",
            roomId: room.id
        }, { status: 200 })
    } catch (err) {
        console.log("Server error. Could not create room.");
        return NextResponse.json({ message: "Server error. Could not create room." }, { status: 500 });
    }
}