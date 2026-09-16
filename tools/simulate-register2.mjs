(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ fullName: 'E2E Register', email: `e2e-register-${Date.now()}@example.com`, phone: '0712345678', password: 'Testpass123!' })
    });
    console.log('status', res.status);
    const j = await res.text();
    console.log('body', j);
  } catch (e) {
    console.error('failed', e);
  }
})();
