import EfiPay from 'sdk-typescript-apis-efi';
import options from '../../credentials';

export default async function ConfigWebhook(req: any, res:any) {
    options['validateMtls'] = false

    let body = {
        webhookUrl: 'https://api.applicco.com.br/prod/webhook',
    }

    let params = {
        chave: 'contato@applicco.com.br',
    }

    const efipay = new EfiPay(options)

    efipay.pixConfigWebhook(params, body)
        .then((resposta) => {
            console.log(resposta)
            return res.json(resposta)
        })
        .catch((error) => {
            console.log(error)
            return res.json(error)
        })

    
}