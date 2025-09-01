import { getExistingShapes } from "./http"
import { Tool } from "@/components/ui/Canvas"


type Shapes = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number,
} | {
    type: "circle",
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
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
    type: "eraser",
    x: number,
    y: number,
    width: number,
    height: number,
}

export class Game {

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private existingShapes: Shapes[]
    private roomId: string
    private socket: WebSocket
    private clicked: boolean
    private startX = 0
    private startY = 0
    private selectedTool: Tool = "pointer"
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
    // private doesRectIntersect(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
    //     return (
    //         a.x < b.x + b.width &&
    //         a.x + a.width > b.x &&
    //         a.y < b.y + b.height &&
    //         a.y + a.height > b.y
    //     );
    // }


    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, token: string) {
        this.token = token
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

    setTool(tool: "circle" | "pencil" | "rect" | "line" | "arrow" | "pointer" | "eraser") {
        this.selectedTool = tool
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


            // if (message.type === "erase") {
            //     const { x, y, width, height } = message.area;

            //     this.existingShapes = this.existingShapes.filter(shape => {
            //         if (shape.type === "rect") {
            //             return !(
            //                 shape.x < x + width &&
            //                 shape.x + shape.width > x &&
            //                 shape.y < y + height &&
            //                 shape.y + shape.height > y
            //             );
            //         }

            //         if (shape.type === "circle") {
            //             const distX = Math.abs(shape.centerX - (x + width / 2));
            //             const distY = Math.abs(shape.centerY - (y + height / 2));
            //             const maxDist = shape.radius + Math.max(width, height) / 2;
            //             return distX > maxDist || distY > maxDist;
            //         }

            //         if (shape.type === "line") {
            //             return !(shape.startX >= x && shape.startX <= x + width &&
            //                 shape.startY >= y && shape.startY <= y + height);
            //         }


            //         if (shape.type === "arrow") {
            //             return !(shape.fromX >= x && shape.fromX <= x + width &&
            //                 shape.fromY >= y && shape.fromY <= y + height);
            //         }

            //         if (shape.type === "pencil") {
            //             return !shape.path.some(p => (
            //                 p.x >= x && p.x <= x + width &&
            //                 p.y >= y && p.y <= y + height
            //             ));
            //         }
            //         return true;
            //     });

            //     this.clearCanvas();
            // }
        }


    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = "#121212"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.existingShapes.map(shape => {
            if (shape.type === "rect") {
                this.ctx.lineWidth = 1
                this.ctx.strokeStyle = "white"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
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
            else if (shape.type === "circle") {
                this.ctx.beginPath()
                this.ctx.strokeStyle = "white"
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, shape.startAngle, shape.endAngle);
                this.ctx.stroke();
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
        // this.existingShapes.map(shape => {
        //     if (shape.type === "eraser") {
        //         this.ctx.fillStyle = "#121212";
        //         this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        //     }
        // })
    }

    // Erase(eraserX: number, eraserY: number, eraserWidth: number, eraserHeight: number) {
        // const eraserBox = { x: eraserX, y: eraserY, width: eraserWidth, height: eraserHeight };

        // this.existingShapes = this.existingShapes.filter(shape => {
            // if (shape.type === "rect") {
            //     return !this.doesRectIntersect(shape, eraserBox);
            // }

    //         if (shape.type === "circle") {
    //             const distX = Math.abs(shape.centerX - (eraserX + eraserWidth / 2));
    //             const distY = Math.abs(shape.centerY - (eraserY + eraserHeight / 2));
    //             const maxDist = shape.radius + Math.max(eraserWidth, eraserHeight) / 2;
    //             return distX > maxDist || distY > maxDist;
    //         }

    //         if (shape.type === "line") {
    //             return !(shape.startX >= eraserX && shape.startX <= eraserX + eraserWidth &&
    //                 shape.startY >= eraserY && shape.startY <= eraserY + eraserHeight);
    //         }

    //         if (shape.type === "arrow") {
    //             return !(shape.fromX >= eraserX && shape.fromX <= eraserX + eraserWidth &&
    //                 shape.fromY >= eraserY && shape.fromY <= eraserY + eraserHeight);
    //         }

    //         if (shape.type === "pencil") {
    //             return !shape.path.some(p => (
    //                 p.x >= eraserX && p.x <= eraserX + eraserWidth &&
    //                 p.y >= eraserY && p.y <= eraserY + eraserHeight
    //             ));
    //         }

    //         return true;
    //     });

    //     this.clearCanvas();
    // }


    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true

        this.startX = (e.clientX)
        this.startY = (e.clientY)

        this.centerX = (e.clientX)
        this.centerY = (e.clientY)

        this.fromX = (e.clientX)
        this.fromY = (e.clientY)

        this.pencilPath = [{ x: (e.clientX), y: (e.clientY) }]
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
                height
            }
        } else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                path: this.pencilPath
            }
        } else if (selectedTool === "circle") {
            const dx = e.clientX - this.centerX;
            const dy = e.clientY - this.centerY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.centerX,
                centerY: this.centerY,
                startAngle: 0,
                endAngle: Math.PI * 2
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
        } else if (selectedTool === "eraser") {
            shape = {
                type: "eraser",
                x: this.startX,
                y: this.startY,
                width,
                height,
            };

            // this.Erase(this.startX, this.startY, width, height);
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

            this.ctx.strokeStyle = "white"
            const selectedTool = this.selectedTool

            // if (this.selectedTool === "eraser") {
            //     const eraserWidth = 50;
            //     const eraserHeight = 50;
            //     const eraserX = e.clientX - eraserWidth / 2;
            //     const eraserY = e.clientY - eraserHeight / 2;

            //     this.clearCanvas();

            //     this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            //     this.ctx.fillRect(eraserX, eraserY, eraserWidth, eraserHeight);
            // }


            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === "circle") {
                const dx = e.clientX - this.centerX;
                const dy = e.clientY - this.centerY;
                const radius = Math.sqrt(dx * dx + dy * dy);

                this.ctx.beginPath()
                this.ctx.strokeStyle = "white"
                this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke()
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

                this.clearCanvas();

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
            }
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
    }

}