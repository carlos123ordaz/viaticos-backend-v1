const express = require('express');
const cors = require('cors');
require('./models/index');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('v.1.0.13');
});

app.use('/api/auth', require('./routes/Auth'));
app.use('/api/gastos', require('./routes/Gasto'));
app.use('/api/usuarios', require('./routes/User'));
app.use('/api/giras', require('./routes/Gira'));
app.use('/api/sedes', require('./routes/Sede'));
app.use('/api/asistencias', require('./routes/Asistencia'));

// Solo iniciar servidor si es ejecución directa (local)
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log('Server running on port: ' + port);
  });
}

// Exportar la aplicación para que Vercel la use como función
module.exports = app;
