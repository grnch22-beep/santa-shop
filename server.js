import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

const products = [
  { id: 1, name: "1000 Подписчиков Twitch", stars: 249 },
  { id: 2, name: "5000 Лайков TikTok", stars: 199 }
];

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

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
        title: "Покупка в Santa Shop",
        description: `Набор услуг (${items.length} шт.)`,
        payload: JSON.stringify({ items }),
        provider_token: "",
        currency: "XTR",
        prices: [{ label: "Услуги", amount: totalStars }]
      })
    });

    const data = await response.json();
    if (data.ok) {
      res.json({ invoiceLink: data.result });
    } else {
      res.status(500).json({ error: data.description });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
