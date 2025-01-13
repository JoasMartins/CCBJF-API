
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

        function generateEventsForYear(events, maxDays = 365) {
            const allOccurrences = [];
            const now = new Date();
        
            for (const event of events) {
                const { _id, recurrence } = event;
                const { startDate, type, interval, daysOfWeek, weekOfMonth } = recurrence;
                const start = new Date(startDate);
                const end = new Date(start);
                end.setDate(end.getDate() + maxDays);
        
                let currentDate = new Date(start);
        
                // Processar recorrências
                while (currentDate <= end) {
                    if (type === "weekly") {
                        // Recorrência semanal
                        if (daysOfWeek.includes(currentDate.getDay())) {
                            allOccurrences.push({
                                _id: _id.$oid || _id,
                                date: currentDate.toISOString()
                            });
                        }
                        currentDate.setDate(currentDate.getDate() + 7 * interval); // Incrementar semanas
                    } else if (type === "monthly" && weekOfMonth && daysOfWeek) {
                        // Recorrência mensal
                        const year = currentDate.getFullYear();
                        const month = currentDate.getMonth();
                        const dayOfWeek = daysOfWeek ? daysOfWeek[0] : [];
                        const week = weekOfMonth ? weekOfMonth[0] : [];
        
                        const nthDay = findNthWeekdayOfMonth(year, month, dayOfWeek, week);
                        if (nthDay) {
                            const eventDate = new Date(nthDay);
                            eventDate.setHours(start.getHours(), start.getMinutes(), start.getSeconds());
        
                            if (eventDate >= now && eventDate <= end) {
                                allOccurrences.push({
                                    _id: _id.$oid || _id,
                                    date: eventDate.toISOString()
                                });
                            }
                        }
                        currentDate.setMonth(currentDate.getMonth() + interval); // Incrementar meses
                    } else {
                        // Recorrência não suportada
                        console.warn(`Recurrence type "${type}" not supported.`);
                        break;
                    }
                }
            }
        
            // Ordenar os eventos pelo mais próximo
            allOccurrences.sort((a, b) => new Date(a.date) - new Date(b.date));
        
            return allOccurrences;
        }
        
        // Função para encontrar o n-ésimo dia da semana no mês
        function findNthWeekdayOfMonth(year, month, dayOfWeek, nth) {
            let count = 0;
            const date = new Date(year, month, 1);
        
            while (date.getMonth() === month) {
                if (date.getDay() === dayOfWeek) {
                    count++;
                    if (count === nth) {
                        return new Date(date); // Retorna uma cópia da data encontrada
                    }
                }
                date.setDate(date.getDate() + 1);
            }
        
            return null; // Caso não encontre o dia
        }
        
        

        let listEvents = await collection.find().toArray()
        console.log(listEvents)
        let result = generateEventsForYear(listEvents, 365)

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
