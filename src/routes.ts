import { Router } from "express";

const router = Router()

router.use(async (req: any, res: any, next: any) => {
    next()
})

//  SISTEMA
router.post("/system/ping", (req: any, res: any) => {
    return res.status(200).send({
        message: "pong"
    })
})

export { router }