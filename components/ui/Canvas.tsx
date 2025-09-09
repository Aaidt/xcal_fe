"use client"

import { useState, useEffect, useRef } from "react"
import IconButton from "./IconButton"
import { Users, Pencil, Circle, Square, Minus, MoveRight, MousePointer, Eraser } from "lucide-react"
import { Game } from "../../game/game"
import { toast } from "react-toastify"
import { useAuth } from "@clerk/nextjs"

export type Tool = "pencil" | "circle" | "rect" | "line" | "arrow" | "pointer" | "eraser"


export default function Canvas({
   socket,
   roomId,
   link,
   visitors
}: {
   socket: WebSocket,
   roomId: string,
   link: string,
   visitors: number | null
}) {
   const { getToken } = useAuth();
   const canvasRef = useRef<HTMLCanvasElement>(null)
   const [selectedTool, setSelectedTool] = useState<Tool>("pencil")
   const [game, setGame] = useState<Game>();

   useEffect(() => {
      game?.setTool(selectedTool)
   }, [selectedTool, game])

   useEffect(() => {
      async function createGame() {
         const token = await getToken();
         if (!token) {
            toast.error('User not logged in.')
            return
         }
         if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket, token);
            setGame(g)

            return () => {
               g.destroy()
            }
         }
      }
      createGame()
   }, [canvasRef, roomId, socket])


   return <div className="min-h-screen overflow-hidden">
      <canvas width={window.innerWidth} height={window.innerHeight} ref={canvasRef} />
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} link={link} visitors={visitors} />
   </div>
}


function Topbar({
   selectedTool,
   setSelectedTool,
   link,
   visitors
}: {
   selectedTool: Tool,
   setSelectedTool: (s: Tool) => void,
   link: string,
   visitors: number | null
}) {
   return (
      <div>
         <div className="flex fixed top-4 left-1/2 -translate-x-1/2 z-50 px-1 py-1 bg-[#232329] gap-2 rounded-lg">
            <IconButton icon={<MousePointer className="size-3.5" fill={`${selectedTool == "pointer" ? "white" : "#232329"}`} strokeWidth="1.5" />}
               onClick={() => setSelectedTool("pointer")}
               activated={selectedTool === "pointer"} />

            <IconButton icon={<Pencil className="size-3.5" strokeWidth="1.5" />}
               onClick={() => setSelectedTool("pencil")}
               activated={selectedTool === "pencil"} />

            <IconButton icon={<Circle className="size-3.5" fill={`${selectedTool == "circle" ? "white" : "#232329"}`} strokeWidth="1.5" />}
               onClick={() => setSelectedTool("circle")}
               activated={selectedTool === "circle"} />

            <IconButton icon={<Square className="size-3.5" fill={`${selectedTool == "rect" ? "white" : "#232329"}`} strokeWidth="1.5" />}
               onClick={() => setSelectedTool("rect")}
               activated={selectedTool === "rect"} />

            <IconButton icon={<Minus className="size-3.5" fill={`${selectedTool == "line" ? "white" : "#232329"}`} strokeWidth="1.5" />}
               onClick={() => setSelectedTool("line")}
               activated={selectedTool === "line"} />

            <IconButton icon={<MoveRight className="size-3.5" fill={`${selectedTool == "arrow" ? "white" : "#232329"}`} strokeWidth="1.5" />}
               onClick={() => setSelectedTool("arrow")}
               activated={selectedTool === "arrow"} />

            <IconButton icon={<Eraser className="size-3.5" strokeWidth="1.5" />}
               onClick={() => setSelectedTool("eraser")}
               activated={selectedTool === "eraser"} />
         </div>

         <div className="fixed top-0 right-0 m-4 flex gap-2 items-center">

            <button onClick={() => {
               toast.success(`Share this link with your friends!! ⚡${link}⚡`)
            }} className="cursor-pointer text-black rounded-md px-3 py-2 bg-[#a9a4ff] text-xs hover:bg-[#a9a4ff]/90 ">
               Share
            </button>

            <div className="text-white cursor-pointer flex items-center gap-2 text-sm rounded-md px-3 py-2 
                    hover:underline hover:underline-offset-3 duration-200">
               <Users strokeWidth="1.5" size="20" />
               People ({visitors !== null ? visitors : "0"})
            </div>

         </div>
      </div>
   )
}
