const axios = require('axios');

async function testBooking() {
  try {
    // 1. Login as user (we need to know a user's credentials, let's try a default one or create one)
    console.log('Registering test user...');
    const userEmail = `testuser_${Date.now()}@example.com`;
    let userRes;
    try {
      userRes = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test User',
        email: userEmail,
        password: 'password123',
        phone: '9999999999',
        role: 'User'
      });
    } catch (err) {
      console.log('Registration error:', err.response?.data || err.message);
      return;
    }
    
    const token = userRes.data.token;
    console.log('User registered. Token:', token);

    // 2. Fetch properties to find an available room
    const propRes = await axios.get('http://localhost:5000/api/properties', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const properties = propRes.data;
    if (properties.length === 0) {
      console.log('No properties found. Please create one as Owner.');
      return;
    }

    // Get units of the first property
    const propId = properties[0]._id;
    const propDetailsRes = await axios.get(`http://localhost:5000/api/properties/${propId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const units = propDetailsRes.data.units;
    const availableUnit = units.find(u => u.status === 'Available');

    if (!availableUnit) {
      console.log('No available units in this property.');
      return;
    }

    console.log(`Booking unit ${availableUnit.unit_no} in property ${properties[0].name}...`);

    // 3. Book the room
    const bookRes = await axios.post('http://localhost:5000/api/leases/book', {
      property_id: propId,
      unit_id: availableUnit._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Booking successful:', bookRes.data);
    
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
}

testBooking();
