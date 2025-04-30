import express from 'express';
import fetch from 'node-fetch';

const wikiroutesRouter = express.Router();

wikiroutesRouter.get('/wikiroutes', async (req, res) => {
    const { lat = '40.4168', lon = '-3.7038', radius = '5000' } = req.query; // Puedes cambiar los valores por defecto
    try {
        const response = await fetch(`https://wikiroutes-api.p.rapidapi.com/getRoutesList?lat=${lat}&lon=${lon}&radius=${radius}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '2a354653a3mshe8b0c196513d19bp11ac11jsn5c666ee93581',
                'X-RapidAPI-Host': 'wikiroutes-api.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Error fetching data from WikiRoutes' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default wikiroutesRouter;
