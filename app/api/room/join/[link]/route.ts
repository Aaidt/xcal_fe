
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../../../../../lib/db/prismaClient";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ link: string }> }
) {
    const { userId } = await auth();
    const { link } = await params;

    if (!userId) {
        return NextResponse.json({ message: "No userId recieved." }, { status: 404 });
    }

    if (!link) {
        return NextResponse.json({ message: "Link param is required" }, { status: 400 });
    }

    try {
        const linkRecord = await prismaClient.link.findUnique({
            where: { link: link },
            include: { room: { include: { user: true } } },
        });

        if (!linkRecord || !linkRecord.room) {
            return NextResponse.json({ message: "No room found for the given link" }, { status: 404 });
        }
        const room = linkRecord.room;
        if (room.adminId !== userId && !room.user.some(u => u.id === userId)) {
            await prismaClient.room.update({
                where: { id: room.id },
                data: {
                    user: { connect: { id: userId } }
                }
            });
            console.log(`User ${userId} added as participant to room ${room.id}`);
        }

        if (linkRecord.room.adminId !== userId) {
            console.log("You are joining the room: " + linkRecord.room.id);
        }

        return NextResponse.json({ roomId: room.id }, { status: 200 });
    } catch (err) {
        console.error("Server error. Could not fetch the room associated with the link.", err);
        return NextResponse.json({ message: "Server error. Could not fetch the room associated with the link." }, { status: 500 });
    }
}
