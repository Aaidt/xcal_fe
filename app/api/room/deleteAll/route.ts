
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "@/lib/prismaClient";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: "No userId recieved." }, { status: 404 });
    }

    try {
        await prismaClient.room.deleteMany({ where: { adminId: userId } })

        return NextResponse.json({ message: "All rooms deleted" }, { status: 200 })
    } catch (err) {
        console.log("Server error. Could not delete rooms.");
        return NextResponse.json({ message: "Server error. Could not delete rooms." }, { status: 500 });
    }
}
