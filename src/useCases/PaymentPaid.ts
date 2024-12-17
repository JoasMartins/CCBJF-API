import { connectToDatabase } from "../configs/DatabaseConfig"
import { io } from "../app"

export default async function PaymentPaid(req: any, res: any) {
    console.log("EVENTO CHAMADO")

    const db = await connectToDatabase()
    const collection = db.collection("payments")

    for(const e of req.body.pix) {
        try {
            console.log(e)
            /*
            const result = await collection.insertOne({
                payment: JSON.stringify(e)
            })
            */

            io.emit("pagamento_confirmado", { e });
            return res.status(200).json(e)
        } catch (error) {
            console.error(error)
            return res.status(500).json(error)
        }
    }
    
}

