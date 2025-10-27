import express, { type Request, type Response } from 'express';
import { db } from "../db/db.js";
import { restaurantCategoriesTable } from "../db/schema.js";

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    console.log('\n===== GET /categories =====');
    console.log('📥 Query:', JSON.stringify(req.query));

    try {
        const categories = await db.select().from(restaurantCategoriesTable);
        console.log(categories);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching resturant categories:', error);
        res.status(500).json({ error: 'Failed to fetch restaurant categories' });
    }
});

export default router;