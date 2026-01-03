
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../../../../../lib/prismaClient";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ roomId: string }> }
) {
    const { userId } = await auth();
    const { roomId } = await params;

    if (!userId) {
        return NextResponse.json({ message: "No userId recieved." }, { status: 404 });
    }
    
    try {
        await prismaClient.room.delete({ where: { id: roomId, adminId: userId } })

        return NextResponse.json({ message: "room deleted" }, { status: 200 });
    } catch (err) {
        console.log("Server error. Could not delete room.");
        return NextResponse.json({ message: "Server error. Could not delete room." }, { status: 500 });
    }
}