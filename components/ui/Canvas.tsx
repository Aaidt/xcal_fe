"use client"

import { useState, useEffect, useRef } from "react"
import IconButton from "./IconButton"
import { Users, Pencil, Circle, Square, Minus, MoveRight, MousePointer, Lasso, Menu } from "lucide-react"
import { Game } from "../../game/game"
import { toast } from "react-toastify"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Draw } from "@/game/draw"
import rough from "roughjs"

export type Tool = "pencil" | "circle" | "rect" | "line" | "arrow" | "pointer" | "ellipse"


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
   const [draw, setDraw] = useState<Draw>();

   useEffect(() => {
      // game?.setTool(selectedTool)
      draw?.setTool(selectedTool)
   }, [selectedTool, game, draw])

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

            // @ts-ignore
            const d = new Draw(rough.canvas(document.getElementById("Canvas")), canvasRef.current, roomId, socket, token);
            setDraw(d)

            return () => {
               g.destroy()
               d.destroy()
            }
         }
      }
      createGame()
   }, [canvasRef, roomId, socket])


   return <div className="min-h-screen overflow-hidden">
      <canvas id="Canvas" width={window.innerWidth} height={window.innerHeight} ref={canvasRef} />
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

   const router = useRouter()
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

            <IconButton icon={<Lasso className="size-3.5" strokeWidth="1.5" />}
               onClick={() => setSelectedTool("ellipse")}
               activated={selectedTool === "ellipse"} />
         </div>


         <div className="fixed top-0 left-0 m-4 flex items-center">

            <button onClick={() => {
               router.push("/dashboard")
            }}
               className="px-3 py-2 bg-gray-400 text-black text-sm hover:bg-gray-300 cursor-pointer rounded-md flex gap-1 items-center"
            ><Menu className="h-4 w-4" /></button>

         </div>

         <div className="fixed top-0 right-0 m-4 flex gap-2 items-center">

            <button onClick={() => {
               toast.success(`Share this link with your friends!! ⚡${link}⚡`)
            }} className="cursor-pointer text-black rounded-md px-3 py-2 bg-[#a9a4ff] text-sm hover:bg-[#a9a4ff]/90 ">
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
