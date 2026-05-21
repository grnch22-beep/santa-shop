import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const BOT_TOKEN = process.env.BOT_TOKEN;

const products = [
  { id: 1, name: "Пак Аватарок №1", stars: 149, file: "https://pixeldrain.com/u/iCXFrMro" },
  { id: 2, name: "Пак Аватарок №2", stars: 179, file: "https://pixeldrain.com/u/8ri8oPf2" }
];

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.post('/create-invoice', async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: "Нет товаров" });

  const totalStars = items.reduce((sum, id) => {
    const p = products.find(prod => prod.id === id);
    return sum + (p ? p.stars : 0);
  }, 0);

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Покупка аватарок",
        description: `Набор из ${items.length} пака`,
        payload: JSON.stringify({ items }),
        provider_token: "",
        currency: "XTR",
        prices: [{ label: "Аватарки", amount: totalStars }]
      })
    });

    const data = await response.json();
    if (data.ok) {
      res.json({ invoiceLink: data.result });
    } else {
      res.status(500).json({ error: data.description });
    }
  } catch (e) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Сервер работает на порту ${PORT}`));
