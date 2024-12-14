import EfiPay from 'sdk-typescript-apis-efi';
import options from '../../credentials';

export default async function ConfigWebhook(req, res) {
    try {
        options['validateMtls'] = false

        let body = {
            webhookUrl: 'https://api.applicco.com.br/prod/webhook',
        }
    
        let params = {
            chave: 'contato@applicco.com.br',
        }
    
        const efipay = new EfiPay(options)

        let result = await efipay.pixConfigWebhook(params, body)
    
        return res.status(200).json(result)
    } catch (error) {
        console.error(error)
        return res.status(500).json(error)
    }
}