const BASE = process.env.BASE_URL || 'http://localhost:5000';

const run = async () => {
  try {
    console.log('Starting smoke test against', BASE);

    const email = `smoke_${Date.now()}@example.com`;
    const password = 'Test1234!';
    console.log('Registering user', email);
    let res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Smoke', lastName: 'Tester', email, password }),
    });
    const reg = await res.json();
    console.log('Register response:', res.status, reg.message || reg);

    res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const login = await res.json();
    if (!login.token) {
      console.error('Login failed', res.status, login);
      process.exit(2);
    }
    console.log('Login succeeded, token length:', login.token.length);
    const token = login.token;

    const bookingPayload = {
      name: 'Smoke Tester',
      email,
      date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      qty: 2,
      placeName: 'Test Place',
      price: 50000,
    };
    res = await fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bookingPayload),
    });
    const created = await res.json();
    console.log('Create booking:', res.status, created._id ? `id=${created._id}` : created);

    res = await fetch(`${BASE}/api/bookings/mine`, { headers: { Authorization: `Bearer ${token}` } });
    const mine = await res.json();
    console.log('My bookings count:', Array.isArray(mine) ? mine.length : mine);
    if (Array.isArray(mine) && mine.length > 0) console.log('Latest booking:', mine[0]);

    console.log('Smoke test finished. Check server logs for email send attempts.');
  } catch (err) {
    console.error('Smoke test error:', err.message || err);
    process.exit(1);
  }
};

run();
