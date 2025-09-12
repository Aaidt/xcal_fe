import { getExistingShapes } from "./http"
import { Tool } from "@/components/ui/Canvas"


type Shapes = {
   type: "rect",
   x: number,
   y: number,
   width: number,
   height: number,
   properties: {
      stroke: string,
      strokeWidth: number,
      roughness: number
   }
} | {
   type: "line",
   startX: number,
   startY: number,
   endX: number,
   endY: number
} | {
   type: "arrow",
   toX: number,
   toY: number,
   fromX: number,
   fromY: number
} | {
   type: "pencil",
   path: { x: number, y: number }[]
} | {
   type: "ellipse"
   x: number,
   y: number,
   width: number,
   height: number
   properties: {
      stroke: string,
      strokeWidth: number,
      roughness: number
   }
}


export class Draw {

   private draw
   private canvas: HTMLCanvasElement
   private ctx: CanvasRenderingContext2D
   private existingShapes: Shapes[]
   private roomId: string
   private socket: WebSocket
   private clicked: boolean
   private startX = 0
   private startY = 0
   private selectedTool: Tool | null = null
   private centerX = 0
   private centerY = 0
   private token: string
   private endX = 0
   private endY = 0
   private leftX = 0
   private baseY = 0
   private rightX = 0
   private fromX = 0
   private fromY = 0
   private pencilPath: { x: number, y: number }[] = [];


   // @ts-ignore
   constructor(draw, canvas, roomId: string, socket: WebSocket, token: string) {
      this.token = token
      this.draw = draw
      this.canvas = canvas
      this.ctx = canvas.getContext("2d")!;
      this.existingShapes = []
      this.roomId = roomId
      this.clicked = false
      this.socket = socket
      this.initMouseHandlers()
      this.initHandlers()
      this.init()
   }

   setTool(tool: "pencil" | "rect" | "line" | "arrow" | "pointer" | "ellipse" | null) {
      this.selectedTool = tool
      if (this.selectedTool !== 'pencil') {
         this.pencilPath = []
      }
   }

   async init() {
      this.existingShapes = await getExistingShapes(this.roomId, this.token)
      this.clearCanvas()
   }

   destroy() {
      this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

      this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

      this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
   }

   initHandlers() {
      this.socket.onmessage = (event) => {
         const message = JSON.parse(event.data);
         // console.log(message);

         if (message.type === "chat") {
            const parsedShape = JSON.parse(message.shape)
            // console.log(parsedShape);
            this.existingShapes.push(parsedShape.shape);
            this.clearCanvas();
         }
      }
   }

   clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.fillStyle = "#121212"
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      this.existingShapes.map(shape => {
         if (shape.type === "rect") {
            this.draw.rectangle(shape.x, shape.y, shape.width, shape.height);
         }
         else if (shape.type === "pencil") {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.path[0]!.x, shape.path[0]!.y);

            for (let i = 1; i < shape.path.length - 1; i++) {
               const midX = (shape.path[i]!.x + shape.path[i + 1]!.x) / 2;
               const midY = (shape.path[i]!.y + shape.path[i + 1]!.y) / 2;

               this.ctx.quadraticCurveTo(shape.path[i]!.x, shape.path[i]!.y, midX, midY);
            }

            const last = shape.path[shape.path.length - 1];
            this.ctx.lineTo(last!.x, last!.y);

            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
         }

         else if (shape.type === "ellipse") {
            this.draw.ellipse(shape.x, shape.y, shape.width, shape.height)
         }
         else if (shape.type === "line") {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.startX, shape.startY)
            this.ctx.lineTo(shape.endX, shape.endY);
            this.ctx.strokeStyle = "white"
            this.ctx.stroke();
         }
         else if (shape.type === "arrow") {
            const fromX = shape.fromX;
            const fromY = shape.fromY;
            const toX = shape.toX;
            const toY = shape.toY;

            const width = 2;
            const headlen = 10;
            const angle = Math.atan2(toY - fromY, toX - fromX);

            const endX = toX - Math.cos(angle) * headlen;
            const endY = toY - Math.sin(angle) * headlen;

            this.ctx.beginPath();
            this.ctx.moveTo(fromX, fromY);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = width;
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(toX, toY);
            this.ctx.lineTo(
               toX - headlen * Math.cos(angle - Math.PI / 7),
               toY - headlen * Math.sin(angle - Math.PI / 7)
            );
            this.ctx.lineTo(
               toX - headlen * Math.cos(angle + Math.PI / 7),
               toY - headlen * Math.sin(angle + Math.PI / 7)
            );
            this.ctx.lineTo(toX, toY);
            this.ctx.closePath();

            this.ctx.fillStyle = "white";
            this.ctx.fill();
            this.ctx.lineWidth = 1;
         }
      })
   }


   mouseDownHandler = (e: MouseEvent) => {
      this.clicked = true

      this.startX = (e.clientX)
      this.startY = (e.clientY)

      this.centerX = (e.clientX)
      this.centerY = (e.clientY)

      this.fromX = (e.clientX)
      this.fromY = (e.clientY)

      if (this.selectedTool === "pencil") {
         this.pencilPath = [{ x: (e.clientX), y: (e.clientY) }]
      }
   }


   mouseUpHandler = (e: MouseEvent) => {
      this.clicked = false

      const width = e.clientX - this.startX
      const height = e.clientY - this.startY

      this.endX = (e.clientX)
      this.endY = (e.clientY)

      const selectedTool = this.selectedTool
      let shape: Shapes | null = null


      if (selectedTool === "rect") {
         shape = {
            type: "rect",
            x: this.startX,
            y: this.startY,
            width,
            height,
            properties: {
               stroke: "white",
               strokeWidth: 1,
               roughness: 0.5
            }
         }
      } else if (selectedTool === "pencil") {
         shape = {
            type: "pencil",
            path: this.pencilPath
         }
      } else if (selectedTool === "line") {
         shape = {
            type: "line",
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY
         }
      } else if (selectedTool === "arrow") {
         shape = {
            type: "arrow",
            fromX: this.fromX,
            fromY: this.fromY,
            toX: e.clientX,
            toY: e.clientY
         }
      } else if (selectedTool === "ellipse") {
         shape = {
            type: "ellipse",
            x: this.fromX,
            y: this.fromY,
            width: width,
            height: height,
            properties: {
               stroke: "white",
               strokeWidth: 1,
               roughness: 0.5
            }

         }
      }

      if (!shape) return;

      this.existingShapes.push(shape)
      this.socket.send(JSON.stringify({
         type: "chat",
         shape: JSON.stringify({
            shape
         }),
         roomId: this.roomId
      }))
   }

   mouseMoveHandler = (e: MouseEvent) => {
      if (this.clicked) {
         const width = e.clientX - this.startX;
         const height = e.clientY - this.startY;

         const baseWidth = height * 2
         this.leftX = this.startX - baseWidth / 2
         this.rightX = this.startX + baseWidth / 2
         this.baseY = this.startY + height

         this.endX = (e.clientX)
         this.endY = (e.clientY)

         this.clearCanvas()

         const selectedTool = this.selectedTool

         if (selectedTool === "rect") {
            this.draw.rectangle(this.startX, this.startY, width, height, { stroke: "white", strokeWidth: 1, roughness: 0.5 });
         } else if (selectedTool === "line") {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY)
            this.ctx.lineTo(this.endX, this.endY)
            this.ctx.strokeStyle = "white"
            this.ctx.stroke()
         } else if (selectedTool === "arrow") {
            const fromX = this.fromX;
            const fromY = this.fromY;
            const toX = e.clientX;
            const toY = e.clientY;

            const shaftWidth = 2;
            const headlen = 10;
            const angle = Math.atan2(toY - fromY, toX - fromX);

            const endX = toX - Math.cos(angle) * headlen;
            const endY = toY - Math.sin(angle) * headlen;

            this.ctx.beginPath();
            this.ctx.moveTo(fromX, fromY);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = shaftWidth;
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(toX, toY);
            this.ctx.lineTo(
               toX - headlen * Math.cos(angle - Math.PI / 7),
               toY - headlen * Math.sin(angle - Math.PI / 7)
            );
            this.ctx.lineTo(
               toX - headlen * Math.cos(angle + Math.PI / 7),
               toY - headlen * Math.sin(angle + Math.PI / 7)
            );
            this.ctx.closePath();

            this.ctx.fillStyle = "white";
            this.ctx.fill();
            this.ctx.lineWidth = 1;
         } else if (selectedTool === "pencil") {
            this.pencilPath.push({ x: e.clientX, y: e.clientY });

            const path = this.pencilPath;
            if (path.length < 2) return;

            this.ctx.beginPath();
            this.ctx.moveTo(path[0]!.x, path[0]!.y);

            for (let i = 1; i < path.length - 1; i++) {
               const midX = (path[i]!.x + path[i + 1]!.x) / 2;
               const midY = (path[i]!.y + path[i + 1]!.y) / 2;

               this.ctx.quadraticCurveTo(path[i]!.x, path[i]!.y, midX, midY);
            }

            const last = path[path.length - 1];
            this.ctx.lineTo(last!.x, last!.y);

            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
         } else if (this.selectedTool === "ellipse") {
            this.draw.ellipse(this.startX, this.startY, width, height, { stroke: "white", strokeWidth: 1, roughness: 0.5 })
         }
      }
   }

   initMouseHandlers() {
      this.canvas.addEventListener("mousedown", this.mouseDownHandler)

      this.canvas.addEventListener("mouseup", this.mouseUpHandler)

      this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
   }

}
