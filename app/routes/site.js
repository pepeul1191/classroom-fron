import dotenv from 'dotenv';
import { Router } from 'express';
import { requireLogin } from '../configs/middlewares.js';

const router = Router();
dotenv.config();

const sharedRoutes = [
  '/',
  '/locations',

  '/assets',
  '/employees',
  '/issues',
  '/tags',
  '/issues/new',
  '/issues/:issue_id/edit',
];

sharedRoutes.forEach((path) => {
  router.get(path, requireLogin, (req, res) => {
    res.locals.title = 'Inicio';
    res.render('site/index');
  });
});

export default router;
