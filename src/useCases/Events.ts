
import { Request, Response } from "express"
import { addDays, isBefore, isAfter, isWithinInterval, addWeeks, addMonths, addYears } from 'date-fns';
import { connectToDatabase } from "../configs/DatabaseConfig"
import { Events } from "../types"
import { ObjectId } from "mongodb";
import { WithId } from "mongodb";

const defaultObject: Events = {
    type: undefined,
    infos: {
        city: undefined,
        district: undefined,
        adress: undefined,
        reference: undefined,
        name: undefined,
    },
    recurrence: undefined
};

interface EventOccurrence {
    _id: string;
    date: Date;
  }

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

async function Nexts(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        function getUpcomingEventOccurrences(events, daysAhead: number = 365): EventOccurrence[] {
            const today = new Date();
            const limitDate = addDays(today, daysAhead);

            const occurrences: EventOccurrence[] = [];

            events.forEach(event => {
                const { _id, recurrence } = event;
                const { startDate, endDate, type, interval = 1, daysOfWeek, weekOfMonth } = recurrence;

                let currentDate = new Date(startDate);
                const endDateObj = endDate ? new Date(endDate) : null;

                while (isBefore(currentDate, limitDate) && (!endDateObj || isBefore(currentDate, endDateObj))) {
                    if (isWithinInterval(currentDate, { start: today, end: limitDate })) {
                        // Adiciona a ocorrência ao array
                        occurrences.push({ _id, date: new Date(currentDate) });
                    }

                    // Incrementa a data com base no tipo de recorrência
                    switch (type) {
                        case "daily":
                            currentDate = addDays(currentDate, interval);
                            break;

                        case "weekly":
                            currentDate = addWeeks(currentDate, interval);
                            break;

                        case "monthly":
                            currentDate = addMonths(currentDate, interval);
                            break;

                        case "yearly":
                            currentDate = addYears(currentDate, interval);
                            break;

                        default:
                            throw new Error(`Tipo de recorrência inválido: ${type}`);
                    }
                }
            });

            return occurrences;
        }

        let listEvents = await collection.find().toArray()
        let result = getUpcomingEventOccurrences(listEvents, 365)

        console.log(result)

        res.status(200).json(result)
    } catch (error) {
        console.log(error)
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
    DELETE,
    Nexts
}
