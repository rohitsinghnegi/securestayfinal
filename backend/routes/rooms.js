import express from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import {
  getRooms,
  getRoomById,
  searchByPhoto,
  createRoom,
  getCities,
  updateSecureSphere,
  deleteRoom
} from '../controllers/roomController.js';

const router = express.Router();

// GET /api/rooms - Search and filter rooms
router.get('/', getRooms);

// GET /api/rooms/:id - Get single room details
router.get('/:id', getRoomById);

// POST /api/rooms/search-by-photo - Photo-based search
router.post('/search-by-photo', searchByPhoto);

// POST /api/rooms - Create new room (Landlord only)
router.post('/', auth, createRoom);

// GET /api/rooms/cities/list - Get list of available cities
router.get('/cities/list', getCities);

// PUT /api/rooms/:id/securesphere - Update SecureSphere data (Landlord only)
router.put('/:id/securesphere', auth, updateSecureSphere);

// DELETE /api/rooms/:id - Delete a room (Landlord owner only)
router.delete('/:id', auth, deleteRoom);

export default router;