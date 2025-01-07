import { Router } from "express";
import credentials from "../credentials";

const router = Router()

//  Validador de token
router.use(async (req: any, res: any, next: any) => {
    const token = req.header("Authorization")

    if(!token) {
        res.status(401).send({
            message: "Token ausente"
        })
        return
    }

    if(token != `Bearer ${credentials.token}`) {
        res.status(401).send({
            message: "Token inválido"
        })
        return
    }

    next()
})

import Events from "./useCases/Events"

//  SISTEMA
router.post("/system/ping", (req: any, res: any) => {
    return res.status(200).send({
        message: "pong"
    })
})

//  Eventos
router.post("/events/get", Events.GET)
router.post("/events/create", Events.POST)
router.post("/events/update", Events.UPDATE)
router.post("/events/delete", Events.DELETE)

export { router }