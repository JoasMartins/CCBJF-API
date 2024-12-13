

export default async function WebhookPIX(req, res) {
    console.log(`Token de acesso tentado: ${req.headers.token_acess} |=| ${process.env.TOKEN_ACESS}`)
    if(req.headers.token_acess != process.env.TOKEN_ACESS) {
        console.error("Token de acesso inválido!")
        return res.status(401).json("INVALID_TOKEN")
    }

    return res.status(200).json("Hello World!")
}