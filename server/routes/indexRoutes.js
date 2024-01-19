import express from "express";
const indexRoutes = express.Router();

indexRoutes.get('/', (req, res) => {
    console.log(req)
    return res.status(200).send("hello world ");
})

export default indexRoutes;