
import { Request, Response } from "express"
import { connectToDatabase } from "../configs/DatabaseConfig"



async function Events(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("types")

        let result = collection.find(req.body)

        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    } 
}


export default {
    Events,
}