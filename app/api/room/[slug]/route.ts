
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../../../../lib/prisma/prismaClient";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { userId } = await auth();
    const { slug } = await params;

    if (!userId) {
        return NextResponse.json({ message: "No userId recieved." }, { status: 404 });
    }

    try {
        const room = await prismaClient.room.findFirst({
            where: {
                slug,
                OR: [
                    { adminId: userId },
                    { user: { some: { id: userId } } }
                ]
            },
            select: {
                link: true,
                id: true
            }
        })

        if (!room) {
            console.log("Could not fetch the room.")
            return NextResponse.json({ message: "Could not fetch the room." }, { status: 403 });
        }
        return NextResponse.json({
            roomId: room.id,
            link: room.link?.link
        }, { status: 200 })

    } catch (err) {
        console.log("Server error. Could not fetch the room.")
        return NextResponse.json({ message: "Server error. Could not fetch the room." }, { status: 500 });
    }
}
