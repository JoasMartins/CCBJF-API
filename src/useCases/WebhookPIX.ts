//import payments from "../payment"

export default async function WebhookPIX(req, res) {
    console.log("WEBHOOK CHAMADO")
    return res.status(200).json("Hello World!")
}