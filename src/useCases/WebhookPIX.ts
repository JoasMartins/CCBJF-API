

export default async function WebhookPIX(req, res) {
    console.log(req.headers)
    //console.log(`Token de acesso tentado: ${req.headers.token_acess} |=| ${process.env.TOKEN_ACESS}`)
    if(req.headers.token_acess != process.env.TOKEN_ACESS) {
        console.error("Token de acesso inválido!")
        res.status(401).json("INVALID_TOKEN")
        return 
    }

    return res.status(200).json("Hello World!")
}