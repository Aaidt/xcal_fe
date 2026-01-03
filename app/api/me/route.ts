
import { auth } from "@clerk/nextjs/server";
import { prismaClient } from "../../../lib/prisma/prismaClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ message: "No userId recieved." }, { status: 404 });
    }

    try {
        const userAlreadyExists = await prismaClient.user.findUnique({
            where: { id: userId }
        });

        if (!userAlreadyExists) {
            await prismaClient.user.create({
                data: { id: userId }
            })
            return NextResponse.json({ message: "User is now in the db." }, { status: 200 });
        } else {
            return NextResponse.json({ message: "User is already in the db" }, { status: 200 });
        }
    } catch (err) {
        console.log("Server error: ", err);
        return NextResponse.json({ message: "Server error " + err }, { status: 500 });
    }
}
