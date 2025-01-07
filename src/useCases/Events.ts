
import { Request, Response } from "express"
import { connectToDatabase } from "../configs/DatabaseConfig"
import { Events } from "../types"
import { ObjectId } from "mongodb";

const defaultObject: Events = {
    type: undefined,
    date: undefined,
    infos: {
        city: undefined,
        district: undefined,
        adress: undefined,
        reference: undefined,
        name: undefined,
    },
  };

function sanitizeInput(input: any): Events {
    const sanitized: Events = { ...defaultObject }
  
    Object.keys(defaultObject).forEach(key => {
      if (key in input) {
        sanitized[key as keyof Events] = input[key]
      }
    });
  
    return sanitized
  }

//===================================================================

async function GET(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const query = { ...req.body }

        // Verifica se _id foi enviado e converte para ObjectId
        if (req.body._id) {
            query._id = new ObjectId(req.body._id)
        }

        const items = await collection.find(query).toArray()

        res.status(200).json(items)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    } 
}

async function POST(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const result = sanitizeInput(req.body)
        const item = await collection.insertOne(result)
        
        res.status(201).json(item)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    } 
}

async function UPDATE(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const query = { ...req.body }
        if (req.body._id) {
            query._id = new ObjectId(req.body._id)
        }

        const result = await collection.updateOne({ _id: query._id }, { $set: query })
        
        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    } 
}

async function DELETE(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const query = { ...req.body }
        if (req.body._id) {
            query._id = new ObjectId(req.body._id)
        }

        const result = await collection.deleteOne({ _id: query._id })
        
        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    } 
}

export default {
    GET,
    POST,
    UPDATE,
    DELETE
}