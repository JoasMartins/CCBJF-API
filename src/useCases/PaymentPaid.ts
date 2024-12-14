import { connectToDatabase } from "../configs/DatabaseConfig"

export default async function PaymentPaid(req: any, res: any) {
    console.log("EVENTO CHAMADO")
    console.log(req.params)

    const db = await connectToDatabase()
    const collection = db.collection("payments")

    const result = await collection.insertOne({
        payment: JSON.stringify(req.params)
    })
    console.log(result);

    for(const e of req.params.pix) {
        try {
            console.log(e)
            const result = await collection.insertOne({
                payment: JSON.stringify(req.params.pix)
            })
        } catch (error) {
            console.error(error)
            return res.status(500).json(error)
        }
    }
    return res.status(200).json(req.params)
}