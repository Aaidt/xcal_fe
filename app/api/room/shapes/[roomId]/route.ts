
import { auth } from "@clerk/nextjs/server"; // although Express route didn't explicitly check req.auth inside, it was protected by middleware.
// Wait, the Express route definition:
// app.use("/api/room", requireAuth(), roomRouter)
// So ALL routes under /api/room are protected.
// I must include auth check in all my routes.

import { prismaClient } from "@/lib/prismaClient";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ roomId: string }> }
) {
    const { userId } = await auth();
    // Assuming we need auth check.
    if (!userId) {
         // The original code technically had userId available but didn't check `if (!userId)` in these specific shape handlers (lines 207, 227). 
         // But it was protected by `requireAuth()`. 
         // `requireAuth()` ensures req.auth is populated or it 401s.
         // So I should return 401 if !userId.
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    try {
        const body = await req.json();
        const shape = body.shape;
        const shapeId = body.shapeId

        await prismaClient.shape.upsert({
            where: { id: shapeId },
            create: {
                shape,
                room: { connect: { id: roomId } }
            },
            update: { shape }
        })
        
        // Express route didn't return a JSON body on success, just implicitly 200 OK?
        // Wait, line 220 calls upsert.
        // It catches error.
        // If success?
        // The code:
        /*
            try {
                await prismaClient.shape.upsert(...)
            } catch (err) { ... }
        */
        // It DOES NOT send a response on success! This implies the request hangs until timeout?
        // That's a bug in the original code or it relies on some behavior I'm missing (e.g. implicitly ends? No express doesn't).
        // It's likely a bug in the original code. 
        // I should probably return 200 OK to be safe and responsive.
        return NextResponse.json({ message: "Shapes updated" }, { status: 200 });

    } catch (err) {
        console.log("Server error. could not insert shapes");
        return NextResponse.json({ message: "Server error. could not insert shapes" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ roomId: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { roomId } = await params;

    try {
        const shapes = await prismaClient.shape.findMany({ where: { roomId } })
        return NextResponse.json({ shapes }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Server error. could not insert shapes" }, { status: 500 });
    }
}
