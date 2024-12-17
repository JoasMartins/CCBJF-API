import payments from "../payment"
import base64toImage from "base64-to-image"

export default async function CreateCodePIX(req, res) {
    const { idContribuicao, amount } = req.body
    console.log(amount)

    try {

        const titleContribuicao = "Terreno de Filgueiras"

        let body = {
            calendario: {
                expiracao: 3600,
            },
            valor: {
                original: Number(amount).toFixed(2)
            },
            chave: 'contato@applicco.com.br', // Informe sua chave Pix cadastrada na efipay.	
            infoAdicionais: [
                {
                    nome: 'Contribuição:',
                    valor: titleContribuicao,
                }
            ],
        }

        const idTransition = Date.now()
        const params = {
            txid: `${idTransition}H00000000000H${idContribuicao}`
        }

        const payment = await payments.pixCreateCharge(params, body)
        const id = payment?.loc?.id

        const qrcode = await payments.pixGenerateQRCode({ id })

        base64toImage(
            qrcode?.imagemQrcode,
            "./src/database/",
            {'fileName': params.txid, 'type':'png'}
        )

        return res.status(200).json({ payment, qrcode })

    } catch (error) {
        console.error(error)
        return res.status(500).json(error)
    }
}

