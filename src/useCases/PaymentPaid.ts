export default async function PaymentPaid(req: any, res: any) {
    console.log("EVENTO CHAMADO")
    console.log(req.params)
    for(const e of req.params.payment.paid) {
        try {
            console.log(e)
        } catch (error) {
            console.error(error)
            return res.status(500).json(error)
        }
    }
    return res.status(200).json(req.params)
}