import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/databse';
import { KnowledgeFile } from '../models/KnowledgeFile';
import { MarketingEvent } from '../models/MarketingEvent';
import { User } from '../models/User';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });

export const getKnowledgeFiles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user || !user.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }
    
    const fileRepo = AppDataSource.getRepository(KnowledgeFile);
    const files = await fileRepo.find({ 
      where: { organizationId: user.organizationId },
      order: { uploadDate: 'DESC' } 
    });
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching knowledge files:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const uploadKnowledgeFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse(ErrorMessages.FILE_UPLOAD_FAILED));
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user?.id } });
    
    if (!user?.organizationId) {
      return res.status(401).json(createErrorResponse(ErrorMessages.UNAUTHORIZED));
    }

    const fileRepo = AppDataSource.getRepository(KnowledgeFile);
    const fileData = {
      id: require('crypto').randomUUID(),
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
      uploader: user.name || user.username,
      organizationId: user.organizationId,
      filePath: req.file.filename
    };

    const savedFile = await fileRepo.save(fileData);
    
    // Update subscription storage usage
    const { StorageService } = require('../services/storageService');
    await StorageService.updateSubscriptionStorageUsage(user.organizationId);

    res.json(savedFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.FILE_UPLOAD_FAILED));
  }
};

export const addKnowledgeFile = async (req: AuthRequest, res: Response) => {
  try {
    console.log('addKnowledgeFile - User:', req.user);
    console.log('addKnowledgeFile - Body:', req.body);
    
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }

    // Get user from database to ensure we have organizationId
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user) {
      return res.status(401).json(createErrorResponse(ErrorMessages.UNAUTHORIZED));
    }

    if (!user.organizationId) {
      return res.status(400).json(createErrorResponse('User must belong to an organization to add files'));
    }

    const fileRepo = AppDataSource.getRepository(KnowledgeFile);
    
    const fileData = {
      ...req.body,
      id: req.body.id || require('crypto').randomUUID(),
      uploadDate: req.body.uploadDate || new Date(),
      organizationId: user.organizationId,
      uploader: req.body.uploader || user.name || user.username
    };
    
    console.log('Saving file data:', fileData);
    
    const file = await fileRepo.save(fileData);
    res.json(file);
  } catch (error) {
    console.error('Error adding knowledge file:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.FILE_UPLOAD_FAILED));
  }
};

export const downloadKnowledgeFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user?.id } });
    
    if (!user?.organizationId) {
      return res.status(401).json(createErrorResponse(ErrorMessages.UNAUTHORIZED));
    }
    
    const fileRepo = AppDataSource.getRepository(KnowledgeFile);
    const file = await fileRepo.findOne({ 
      where: { id, organizationId: user.organizationId }
    });
    
    if (!file) {
      return res.status(404).json(createErrorResponse(ErrorMessages.FILE_NOT_FOUND));
    }
    
    // If file has external URL, redirect
    if (file.url) {
      return res.redirect(file.url);
    }
    
    // For uploaded files, serve from disk
    if (file.filePath) {
      const filePath = path.join(__dirname, '../../uploads', file.filePath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json(createErrorResponse(ErrorMessages.FILE_NOT_FOUND));
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
      res.setHeader('Content-Type', file.type || 'application/octet-stream');
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      return;
    }
    
    return res.status(404).json(createErrorResponse(ErrorMessages.FILE_NOT_FOUND));
    
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.FILE_NOT_FOUND));
  }
};

export const deleteKnowledgeFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user?.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }

    const fileRepo = AppDataSource.getRepository(KnowledgeFile);
    
    // Find file and verify it belongs to user's organization
    const file = await fileRepo.findOne({ 
      where: { id: req.params.id, organizationId: user.organizationId }
    });
    
    if (!file) {
      return res.status(404).json(createErrorResponse(ErrorMessages.FILE_NOT_FOUND));
    }
    
    await fileRepo.delete(req.params.id);
    
    // Update subscription storage usage after deletion
    const { StorageService } = require('../services/storageService');
    await StorageService.updateSubscriptionStorageUsage(user.organizationId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting knowledge file:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.FILE_DELETE_FAILED));
  }
};

export const getMarketingEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(MarketingEvent);
    const events = await eventRepo.find();
    res.json(events);
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const addMarketingEvent = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(MarketingEvent);
    
    if (!req.body.id) {
      req.body.id = require('crypto').randomUUID();
    }
    
    if (!req.body.language) {
      req.body.language = 'en';
    }
    
    if (!req.body.organizationId) {
      req.body.organizationId = '550e8400-e29b-41d4-a716-446655440001';
    }
    
    const event = await eventRepo.save(req.body);
    res.json(event);
  } catch (error) {
    console.error('Error adding marketing event:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};
