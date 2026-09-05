import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formType, payload } = req.body;

  try {
    if (formType === 'contact') {
      await db.execute({
        sql: `INSERT INTO submissions (form_type, name, email, message) VALUES (?, ?, ?, ?)`,
        args: ['contact', payload.name, payload.email, payload.message],
      });
    } else if (formType === 'book-call') {
      await db.execute({
        sql: `INSERT INTO submissions (form_type, name, email, project_type, target_timeline, message) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          'book-call',
          payload.full_name,
          payload.email,
          payload.project_type,
          payload.target_timeline,
          payload.project_overview,
        ],
      });
    } else {
      return res.status(400).json({ error: 'Invalid form type' });
    }

    return res.status(200).json({ success: true, message: 'Saved to Turso!' });
  } catch (error) {
    console.error('Turso Error:', error);
    return res.status(500).json({ error: 'Database insert failed' });
  }
}
