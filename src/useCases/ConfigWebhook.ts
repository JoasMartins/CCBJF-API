import EfiPay from 'sdk-typescript-apis-efi';
import options from '../../credentials';

export default async function ConfigWebhook(req, res) {
    options['validateMtls'] = false

    let body = {
        webhookUrl: 'https://api.applicco.com.br/prod/webhook',
    }

    let params = {
        chave: 'contato@applicco.com.br',
    }

    const efipay = new EfiPay(options)

    return await efipay.pixConfigWebhook(params, body)
}