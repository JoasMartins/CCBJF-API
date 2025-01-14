
import { Request, Response } from "express"
import { addDays, isBefore, isAfter, isWithinInterval, addWeeks, addMonths, addYears } from 'date-fns';
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { ChatGPTAPI } from 'chatgpt'
import { connectToDatabase } from "../configs/DatabaseConfig"
import { Events } from "../types"
import { ObjectId } from "mongodb";
import { WithId } from "mongodb";

const defaultObject: Events = {
    type: undefined,
    infos: {
        city: undefined,
        district: undefined,
        adress: undefined,
        reference: undefined,
        name: undefined,
        description: undefined
    },
    recurrence: undefined
};

interface EventOccurrence {
    _id: string;
    date: Date;
}

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const GPT = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  })

function sanitizeInput(input: any): Events {
    const sanitized: Events = { ...defaultObject }

    Object.keys(defaultObject).forEach(key => {
        if (key in input) {
            sanitized[key as keyof Events] = input[key]
        }
    });

    return sanitized
}

function IAtoJSON(response: string) {
    let cut = response.replace('```json', '')
    cut = cut.replace('```', '')

    return JSON.parse(cut)
}

//===================================================================

async function GET(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const query = { ...req.body }

        // Verifica se _id foi enviado e converte para ObjectId
        if (req.body._id) {
            query._id = new ObjectId(req.body._id)
        }

        const items = await collection.find(query).toArray()

        res.status(200).json(items)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    }
}

async function POST(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const result = sanitizeInput(req.body)
        const item = await collection.insertOne(result)

        res.status(201).json(item)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    }
}

async function UPDATE(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const query = { ...req.body }
        if (req.body._id) {
            query._id = new ObjectId(req.body._id)
        }

        const result = await collection.updateOne({ _id: query._id }, { $set: query })

        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    }
}

async function DELETE(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        const query = { ...req.body }
        if (req.body._id) {
            query._id = new ObjectId(req.body._id)
        }

        const result = await collection.deleteOne({ _id: query._id })

        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    }
}

async function Nexts(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("events")

        function generateEventsForYear(events, maxDays = 365) {
            const allOccurrences = [];
            const now = new Date();

            for (const event of events) {
                const { _id, recurrence } = event;
                const { startDate, type, interval, daysOfWeek, weekOfMonth } = recurrence;
                const start = new Date(startDate);
                const end = new Date(start);
                end.setDate(end.getDate() + maxDays);

                let currentDate = new Date(start);

                // Processar recorrências
                while (currentDate <= end) {
                    if (type === "weekly") {
                        // Recorrência semanal
                        if (daysOfWeek.includes(currentDate.getDay())) {
                            allOccurrences.push({
                                _id: _id.$oid || _id,
                                date: currentDate.toISOString()
                            });
                        }
                        currentDate.setDate(currentDate.getDate() + 7 * interval); // Incrementar semanas
                    } else if (type === "monthly" && weekOfMonth && daysOfWeek) {
                        // Recorrência mensal
                        const year = currentDate.getFullYear();
                        const month = currentDate.getMonth();
                        const dayOfWeek = daysOfWeek ? daysOfWeek[0] : [];
                        const week = weekOfMonth ? weekOfMonth[0] : [];

                        const nthDay = findNthWeekdayOfMonth(year, month, dayOfWeek, week);
                        if (nthDay) {
                            const eventDate = new Date(nthDay);
                            eventDate.setHours(start.getHours(), start.getMinutes(), start.getSeconds());

                            if (eventDate >= now && eventDate <= end) {
                                allOccurrences.push({
                                    _id: _id.$oid || _id,
                                    date: eventDate.toISOString()
                                });
                            }
                        }
                        currentDate.setMonth(currentDate.getMonth() + interval); // Incrementar meses
                    } else {
                        // Recorrência não suportada
                        console.warn(`Recurrence type "${type}" not supported.`);
                        break;
                    }
                }
            }

            // Ordenar os eventos pelo mais próximo
            allOccurrences.sort((a, b) => new Date(a.date) - new Date(b.date));

            return allOccurrences;
        }

        // Função para encontrar o n-ésimo dia da semana no mês
        function findNthWeekdayOfMonth(year, month, dayOfWeek, nth) {
            let count = 0;
            const date = new Date(year, month, 1);

            while (date.getMonth() === month) {
                if (date.getDay() === dayOfWeek) {
                    count++;
                    if (count === nth) {
                        return new Date(date); // Retorna uma cópia da data encontrada
                    }
                }
                date.setDate(date.getDate() + 1);
            }

            return null; // Caso não encontre o dia
        }



        let listEvents = await collection.find().toArray()
        console.log(listEvents)
        let result = generateEventsForYear(listEvents, 365)

        console.log(result)

        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    }
}

async function CreateIA(req: Request, res: Response) {
    try {
        const db = await connectToDatabase()
        const collectionTypes = db.collection("types")

        let listTypesEvent = await collectionTypes.findOne({ title: "typeEvent" })
        let listCities = await collectionTypes.findOne({ title: "city" })

        const prompt = `
Converse comigo apenas em pt-BR. Este é a uma função de site, onde o invés do usuario preencher o formulario ele apenas diz para a IA(voce) e baseado nas regras do sistema voce vai processar o que é pedido e devolver o resoltado divido em alguns formatos especificos para que eles sejam separados pelo script e preencha o formulario.

Como funciona a função:
O sistema de recorrência de eventos tem como objetivo gerenciar eventos que ocorrem em padrões definidos no tempo. Você receberá um pedido do usuário e deve gerar um objeto baseado na seguinte estrutura:
esse é o objeto a ser retornado:
{
  type: string, // Obrigatótio
  infos: {
    city: string, // Obrigatótio
    district: string, // Obrigatótio
    adress?: string; // Opcional
    reference?: string; // Opcional
    name?: string; // Opcional
    description?: string; // Opcional
  },
  recurrence: {
    startDate: string; // Data inicial no formato ISO (e.g., "2025-01-15T00:00:00Z")
    endDate?: string; // (Opcional) Data final no formato ISO
    startTime: string; // horário de início (ex: 19:30)
    endTime: string; // horário de término (ex: 21:00)
    type: "daily" | "weekly" | "monthly" | "yearly"; // Tipo de recorrência
    interval?: number; // Intervalo entre ocorrências (e.g., 1 = todo dia/semana/mês/ano)
    daysOfWeek?: number[]; // Dias da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
    weekOfMonth?: number[]; // Array de semanas do mês (e.g., [1, 3] para primeira e terceira semanas, [-1] para ultima semana)
  }
}

Os seguintes valores deve ser apenas uma das opções da array que será dita, baseada no pedido defina qual valor mais se encaixa:
type: ${JSON.stringify(listTypesEvent.list) || "[]"}
infos.city: ${JSON.stringify(listCities.list) || "[]"}

Se das opções nenhuma é parecido com o pedido, apenas não preencha esse item, evite sair do contexto.
Agora, interprete o pedido do usuario, se algum dado do objeto não foi esclarecido no pedido, e os itens que nao foram necessario, apenas nao insira no objeto.

depois de definir a cidade, o proximo nome de local deve ser 'district'.

Se horario de termino ao foi esclarecido, apenas nao preencha esse item no objeto.

Para definir os valores dentro de recurrence, saiba como funciona o sistema:
O sistema de recorrência foi projetado para gerenciar eventos que ocorrem repetidamente em intervalos específicos. Ele permite definir as configurações de repetição de um evento com base em datas e padrões regulares.

Abaixo está a explicação de como configurar os valores do campo recurrence:

Campos de Configuração
startDate (obrigatório):

Define a data inicial do evento no formato ISO (e.g., 2025-01-15T00:00:00Z).
Essa é a data em que a recorrência começa.

endDate (opcional):

Determina até quando o evento será recorrente. Caso não seja fornecido, a recorrência será calculada até o limite de um ano a partir da startDate.

startTime (obrigatório):

Representa o horário de início do evento (e.g., 19:30).
É apenas informativo e não influencia na recorrência.

endTime (obrigatório):

Representa o horário de término do evento (e.g., 21:00).
Também é apenas informativo.

type (obrigatório):

Indica o tipo de recorrência. Os valores possíveis são:
"daily": Eventos que ocorrem todos os dias ou a cada X dias.
"weekly": Eventos que ocorrem em dias específicos da semana.
"monthly": Eventos que ocorrem em semanas específicas de cada mês.
"yearly": Eventos que se repetem em datas específicas a cada ano.
interval (opcional):

Determina o intervalo entre as ocorrências do evento.
Exemplo:
Se type for "daily" e interval for 2, o evento ocorre a cada 2 dias.
Se type for "monthly" e interval for 3, o evento ocorre a cada 3 meses.

daysOfWeek (opcional):

Aplica-se a eventos do tipo "weekly" ou "monthly".
Especifica os dias da semana em que o evento ocorre.
Valores possíveis:
0: Domingo
1: Segunda-feira
2: Terça-feira
3: Quarta-feira
4: Quinta-feira
5: Sexta-feira
6: Sábado
Exemplo:
Para eventos que ocorrem às segundas e quartas, defina [1, 3].

weekOfMonth (opcional):

Aplica-se a eventos do tipo "monthly".
Especifica as semanas do mês em que o evento ocorre.
Valores possíveis:
1: Primeira semana
2: Segunda semana
3: Terceira semana
4: Quarta semana
-1: Última semana
Exemplo:
Para eventos que ocorrem na primeira e terceira semanas do mês, defina [1, 3].

Exemplos de Configuração
Evento diário:

"type": "daily"
"interval": 1 (ocorre todos os dias)
Evento semanal:

"type": "weekly"
"daysOfWeek": [0, 6] (ocorre aos domingos e sábados)
Evento mensal:

"type": "monthly"
"interval": 2 (ocorre a cada 2 meses)
"weekOfMonth": [2] (na segunda semana do mês)
"daysOfWeek": [5] (às sextas-feiras)
Evento anual:

"type": "yearly"
"startDate": "2025-06-10T00:00:00Z"

se for um evento que acontece apenas uma vez, use por exemplo:
{
  startDate: "2025-06-15T19:30:00Z", // Data e horário do evento
  endDate: "2025-06-15T21:00:00Z", // Igual ao startDate com o horário ajustado, indicando que o evento não se repete
  startTime: "19:30", // Horário de início
  endTime: "21:00", // Horário de término
  type: "daily", // Ainda pode usar "daily", mas sem configurar intervalos
  interval: 0, // Opcional, pois não haverá intervalo de repetição
}

O sistema é flexível e permite criar configurações de recorrência complexas de forma eficiente. Se algum campo não for necessário para o tipo de recorrência escolhido, ele pode ser omitido.

Como voce nao sabe a data exata de hoje, hoje é ${new Date().toISOString()}}.
A data final deve ser preenchida apenas se o pedido não tiver recorrencia.
ATENÇÃO: Retorne o resultado diretamente como um objeto JSON, e não como uma string. O JSON deve estar no formato esperado, para que eu possa utilizá-lo diretamente com JSON.parse() sem precisar tratar aspas adicionais ou caracteres desnecessários. 
Caso todos os dados obrigatórios foram possiveis definir retorne o objeto do evento, caso o pedido nao esclareceu alguma informação obrigatória e algum item esta com o valor de null retorne a mensagem de erro.
O pedido do usuario é:

${req.body.message}
`

        const consultIA = await model.generateContent(prompt)
        const result = IAtoJSON(consultIA.response.text())

        console.log(result)

        let verify = await model.generateContent(`
Observe essa lista de instruções:
{
  type - deve ser uma dessas opções: ${JSON.stringify(listTypesEvent.list) || "[]"}
  infos: {
    city - deve ser uma dessas opções: ${JSON.stringify(listCities.list) || "[]"}
    district - deve ser um texto, esse é o nome do distrito ou bairro.
  },
  recurrence: {
    startDate - deve ser uma data para o primeiro evento.
    startTime - horario de inicio
    endTime - horario de termino
  }
}

esses sao os itens que são obrigatórios para o objeto JSON. valores que nao estao nessa instrução DEVEM SER IGNORADOS!

Observe o objeto JSON completo a seguir, e verifique todos os itens e valores, se tiver algum item que é obrigatório e está com valor null ou que nao foi definido retorne uma mensagem no seguinte formato:
Retorne apenas um objeto JSON com um item chamado 'error' e seu valor deve ser uma mensagem dizendo todos os itens que não foram definidos e pedindo para inserir essas informações no pedido.
o nome dos itens no texto de resposta deve ser em linguagem humana.
REPETINDO: se um valor esta no JSON a verificar mas não está no JSON de instruções, esse valor deve ser ignorado.

o item dateEnd é o unico item que pode ficar como null.

Caso nenhum valor esteja como null apenas retorne esse objeto JSON com o item 'error' com valor false

Esse é o objeto JSON a ser verificado:
${JSON.stringify(result)}
`)

        console.log(verify.response.text())
        verify = IAtoJSON(verify.response.text())
        console.log(verify)

        
        let resultGPT = await GPT.sendMessage("Olá, tudo bem?")
        console.log(resultGPT.text)
        return res.status(200).json(resultGPT)

        if(verify?.error === false){
            return res.status(200).json(result)
        } else {
            return res.status(400).json(verify)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error?.message })
    } finally {
        return
    }
}



export default {
    GET,
    POST,
    UPDATE,
    DELETE,
    Nexts,
    CreateIA
}
