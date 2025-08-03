import dotenv from 'dotenv';
import { Router } from 'express';
import { redirectIfLoggedIn, requireLogin } from '../configs/middlewares.js';
import { login } from '../configs/services.js';

const router = Router();
dotenv.config();

router.get('/sign-in', redirectIfLoggedIn, (req, res) => {
  res.render('session/sign-in', {
    error: req.flash('error'),
    title: 'Bienvenido',
  });
});

router.get('/sign-up', redirectIfLoggedIn, (req, res) => {
  res.render('session/sign-up', {
    error: req.flash('error'),
    title: 'Bienvenido',
  });
});

router.get('/reset-password', redirectIfLoggedIn, (req, res) => {
  res.render('session/reset-password', {
    error: req.flash('error'),
    title: 'Bienvenido',
  });
});

router.post('/sign-in', async (req, res) => {
  const { username, password } = req.body;

  // Verificamos si los campos están vacíos
  if (!username || !password) {
    req.flash('error', 'Debe de ingresar su usuario y contraseña');
    return res.redirect('/sign-in');  // Redirigir a la vista de login con el error
  }

  try {
    const answer = await login(username, password);
    
    if (answer.status === 200) {
      // Si el login es exitoso, almacenar los datos del usuario en la sesión
      // console.log(answer)
      req.session.user = answer.user;   
      req.session.user.id = String(answer.user.id);
      req.session.tokens = answer.tokens;
      req.session.person = answer.person;
      req.session.login_at = new Date();
      // Redirigir a la página principal
      return res.redirect('/');
    } else {
      // Si el login falla, almacenar el error en la sesión y redirigir al login
      req.flash('error', answer.body.error || 'Error desconocido al iniciar sesión');
      return res.redirect('/sign-in');
    }
  } catch (error) {
    console.error(error);
    // Si ocurre un error del servidor, redirigir al login con el mensaje de error
    req.flash('error', 'Error interno del servidor: ' + error.message);
    return res.redirect('/sign-in');
  }
});

router.get('/sign-out', requireLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.render('session/sign-out');
  });
});

// Ruta para obtener los datos de la sesión
router.get('/session', requireLogin, (req, res) => {
  // Verificar si existe una sesión activa
  if (req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user,
      person: req.session.person,
      tokens: req.session.tokens,
      sessionId: req.sessionID,
      createdAt: req.session.cookie.expires
    });
  } else {
    res.json({
      authenticated: false,
      message: 'No hay sesión activa'
    });
  }
});

export default router;