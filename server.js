import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN; // берём из переменных Render

const products = [
  { id: 1, name: "Космос & Неон", stars: 49, file: "https://твоя_ссылка1.zip" },
  { id: 2, name: "Аниме стиль", stars: 79, file: "https://твоя_ссылка2.zip" },
  { id: 3, name: "Минимализм 2026", stars: 119, file: "https://твоя_ссылка3.zip" }
];

app.post('/create-invoice', async (req, res) => {
  const { items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Нет товаров" });
  }

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
        description: `Набор из ${items.length} товаров`,
        payload: JSON.stringify({ items, timestamp: Date.now() }),
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

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});