import payments from "../payment"

export default async function WebhookPIX(req, res) {
    return res.status(200).json("Hello World!")
}