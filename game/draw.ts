import { getExistingShapes } from "./http"
import { Tool } from "@/components/ui/Canvas"
import rough from "roughjs"

type Shape = {
   type: "rect",
   x: number,
   y: number,
   width: number,
   height: number,
   properties: {
      stroke: string,
      strokeWidth: number,
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
   }
}

export class Draw {

   private draw
   private drawPreview
   private previewCanvas
   private previewCtx: CanvasRenderingContext2D
   private canvas: HTMLCanvasElement
   private ctx: CanvasRenderingContext2D
   private existingShapes: Shape[]
   private roomId: string
   private socket: WebSocket
   private clicked: boolean
   private startX = 0
   private startY = 0
   private selectedTool: Tool | null = null
   private token: string
   private endX = 0
   private endY = 0
   private fromX = 0
   private fromY = 0
   private pencilPath: { x: number, y: number }[] = [];


   constructor(previewCanvas: HTMLCanvasElement, canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, token: string) {
      this.token = token
      this.previewCanvas = previewCanvas
      this.previewCtx = previewCanvas.getContext("2d")!;
      this.drawPreview = rough.canvas(previewCanvas)
      this.canvas = canvas
      this.draw = rough.canvas(canvas)
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
      this.startX = 0
      this.startY = 0
      this.endX = 0
      this.endY = 0
   }

   async init() {
      this.existingShapes = await getExistingShapes(this.roomId, this.token)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.fillStyle = "#121212"
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.existingShapes.forEach(shape => {
         this.drawShape(this.ctx, this.draw, shape)
      })
   }

   destroy() {
      this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

      this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

      this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
   }

   initHandlers() {
      this.socket.onmessage = (event) => {
         const message = JSON.parse(event.data);

         if (message.type === "chat") {
            const parsedShape = JSON.parse(message.shape)
            this.existingShapes.push(parsedShape.shape);
            this.drawShape(this.ctx, this.draw, parsedShape.shape)
         }
      }
   }

   private drawShape(ctx: CanvasRenderingContext2D, rc: any, shape: Shape) {
      if (shape.type === "rect") {
         rc.rectangle(shape.x, shape.y, shape.width, shape.height, shape.properties);
      }
      else if (shape.type === "pencil") {
         if (shape.path.length < 2) return;
         ctx.beginPath();
         ctx.moveTo(shape.path[0].x, shape.path[0].y);

         for (let i = 1; i < shape.path.length - 1; i++) {
            const midX = (shape.path[i].x + shape.path[i + 1].x) / 2;
            const midY = (shape.path[i].y + shape.path[i + 1].y) / 2;
            ctx.quadraticCurveTo(shape.path[i].x, shape.path[i].y, midX, midY);
         }

         const last = shape.path[shape.path.length - 1];
         ctx.lineTo(last.x, last.y);

         ctx.strokeStyle = "white";
         ctx.lineWidth = 3;
         ctx.stroke();
      }

      else if (shape.type === "ellipse") {
         rc.ellipse(shape.x, shape.y, shape.width, shape.height, shape.properties)
      }
      else if (shape.type === "line") {
         ctx.beginPath();
         ctx.moveTo(shape.startX, shape.startY)
         ctx.lineTo(shape.endX, shape.endY);
         ctx.strokeStyle = "white"
         ctx.stroke();
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

         ctx.beginPath();
         ctx.moveTo(fromX, fromY);
         ctx.lineTo(endX, endY);
         ctx.strokeStyle = "white";
         ctx.lineWidth = width;
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(toX, toY);
         ctx.lineTo(
            toX - headlen * Math.cos(angle - Math.PI / 7),
            toY - headlen * Math.sin(angle - Math.PI / 7)
         );
         ctx.lineTo(
            toX - headlen * Math.cos(angle + Math.PI / 7),
            toY - headlen * Math.sin(angle + Math.PI / 7)
         );
         ctx.lineTo(toX, toY);
         ctx.closePath();

         ctx.fillStyle = "white";
         ctx.fill();
         ctx.lineWidth = 1;
      }
   }


   mouseDownHandler = (e: MouseEvent) => {
      this.clicked = true

      this.startX = e.offsetX
      this.startY = e.offsetY

      this.fromX = e.offsetX
      this.fromY = e.offsetY

      if (this.selectedTool === "pencil") {
         this.pencilPath = [{ x: e.offsetX, y: e.offsetY }]
      }
   }


   mouseUpHandler = (e: MouseEvent) => {
      this.clicked = false

      const endX = e.offsetX
      const endY = e.offsetY

      const selectedTool = this.selectedTool
      let shape: Shape | null = null

      if (selectedTool === "rect") {
         const x = Math.min(this.startX, endX)
         const y = Math.min(this.startY, endY)
         const width = Math.abs(endX - this.startX)
         const height = Math.abs(endY - this.startY)
         if (width === 0 || height === 0) return
         shape = {
            type: "rect",
            x,
            y,
            width,
            height,
            properties: {
               stroke: "white",
               strokeWidth: 1,
            }
         }
      } else if (selectedTool === "pencil") {
         if (this.pencilPath.length < 2) return
         shape = {
            type: "pencil",
            path: this.pencilPath
         }
         this.pencilPath = []
      } else if (selectedTool === "line") {
         shape = {
            type: "line",
            startX: this.startX,
            startY: this.startY,
            endX,
            endY
         }
      } else if (selectedTool === "arrow") {
         shape = {
            type: "arrow",
            fromX: this.fromX,
            fromY: this.fromY,
            toX: endX,
            toY: endY
         }
      } else if (selectedTool === "ellipse") {
         const x = (this.startX + endX) / 2
         const y = (this.startY + endY) / 2
         const width = Math.abs(endX - this.startX)
         const height = Math.abs(endY - this.startY)
         if (width === 0 || height === 0) return
         shape = {
            type: "ellipse",
            x,
            y,
            width,
            height,
            properties: {
               stroke: "white",
               strokeWidth: 1,
            }
         }
      }

      if (!shape) return;

      this.existingShapes.push(shape)
      this.drawShape(this.ctx, this.draw, shape)
      this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.socket.send(JSON.stringify({
         type: "chat",
         shape: JSON.stringify({
            shape
         }),
         roomId: this.roomId
      }))
   }

   mouseMoveHandler = (e: MouseEvent) => {
      if (!this.clicked) return

      const endX = e.offsetX
      const endY = e.offsetY

      let preview: Shape | null = null;

      const selectedTool = this.selectedTool

      if (selectedTool === "rect") {
         const x = Math.min(this.startX, endX)
         const y = Math.min(this.startY, endY)
         const width = Math.abs(endX - this.startX)
         const height = Math.abs(endY - this.startY)
         preview = {
            type: "rect",
            x,
            y,
            width,
            height,
            properties: {
               stroke: "white",
               strokeWidth: 1,
            }
         }

      } else if (selectedTool === "line") {

         preview = {
            type: "line",
            startX: this.startX,
            startY: this.startY,
            endX,
            endY
         }

      } else if (selectedTool === "arrow") {

         preview = {
            type: "arrow",
            fromX: this.fromX,
            fromY: this.fromY,
            toX: endX,
            toY: endY
         }

      } else if (selectedTool === "pencil") {

         this.pencilPath.push({ x: endX, y: endY });

         preview = {
            type: "pencil",
            path: this.pencilPath
         }

      } else if (this.selectedTool === "ellipse") {

         const x = (this.startX + endX) / 2
         const y = (this.startY + endY) / 2
         const width = Math.abs(endX - this.startX)
         const height = Math.abs(endY - this.startY)
         preview = {
            type: "ellipse",
            x,
            y,
            width,
            height,
            properties: {
               stroke: "white",
               strokeWidth: 1,
            }
         }
      }

      this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      if (preview) {
         this.drawShape(this.previewCtx, this.drawPreview, preview)
      }
   }

   initMouseHandlers() {
      this.canvas.addEventListener("mousedown", this.mouseDownHandler)

      this.canvas.addEventListener("mouseup", this.mouseUpHandler)

      this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
   }

}
