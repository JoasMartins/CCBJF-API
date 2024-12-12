import { Router } from "express";
import multer from "multer";
//import cors from "cors"
//import { conectarAoBanco } from "./database";
import CreateCodePIX from "./useCases/CreateCodePIX";

const router = Router()


router.use(async (req: any, res: any, next: any) => {
    //console.log(req.database)
    //let databaseConected = await conectarAoBanco(process.env.DATABASE_URI, req)
    //req.database = databaseConected
    next()
})

router.post("/users", (req: any, res: any) => {
    return res.status(201).send()
})

router.post("/payment/create", CreateCodePIX)

export { router }