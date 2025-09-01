import axios from 'axios';
import { toast } from "react-toastify"
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export async function getExistingShapes(roomId: string, token: string) {
    let message;
    try {
        const response = await axios.get(`${BACKEND_URL}/api/room/shapes/${roomId}`, {
            headers: { "Authorization": token }
        })
        // console.log(response?.data?.shapes)
        message = response?.data?.shapes
        const shapes = message.map((x: {shape: string}) => {
            const parsedShape = JSON.parse(x.shape)
            return parsedShape.shape
        })
        return shapes
    } catch (e) {
        toast.error('Error in fetching the existing shapes. ' + e)
    }

}