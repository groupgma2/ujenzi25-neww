import fetch from 'node-fetch';

(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ fullName: 'E2E Register', email: `e2e-register+${Date.now()}@example.com`, phone: '0712345678', password: 'Testpass123!' })
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log('body', text);
  } catch (e) {
    console.error('request failed', e.message);
  }
})();
