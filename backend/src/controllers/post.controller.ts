import { Request, Response } from 'express';
import { AppDataSource } from '../config/databse';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const postRepo = AppDataSource.getRepository(Post);
    const posts = await postRepo.find({ 
      order: { timestamp: 'DESC' },
      relations: ['comments']
    });
    
    // Sort comments by timestamp for each post
    posts.forEach(post => {
      if (post.comments) {
        post.comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
    });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addPost = async (req: AuthRequest, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user) {
      return res.status(404).json(createErrorResponse(ErrorMessages.USER_NOT_FOUND));
    }

    const postRepo = AppDataSource.getRepository(Post);
    
    const post = postRepo.create({
      content: req.body.content,
      authorId: req.user.id,
      authorName: user.name,
      authorLogoUrl: undefined,
      timestamp: new Date(),
      likes: 0
    });
    
    const savedPost = await postRepo.save(post);
    res.json(savedPost);
  } catch (error) {
    console.error('Error adding post:', error);
    res.status(500).json({ 
      error: 'Failed to add post',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const postRepo = AppDataSource.getRepository(Post);
    
    // Check if post exists and user owns it
    const post = await postRepo.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).json(createErrorResponse(ErrorMessages.NOT_FOUND));
    }
    
    if (post.authorId !== req.user.id) {
      return res.status(403).json(createErrorResponse(ErrorMessages.ACCESS_DENIED));
    }
    
    await postRepo.update(req.params.id, { content: req.body.content });
    const updatedPost = await postRepo.findOne({ 
      where: { id: req.params.id },
      relations: ['comments']
    });
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const postRepo = AppDataSource.getRepository(Post);
    
    // Check if post exists and user owns it
    const post = await postRepo.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).json(createErrorResponse(ErrorMessages.NOT_FOUND));
    }
    
    if (post.authorId !== req.user.id) {
      return res.status(403).json(createErrorResponse(ErrorMessages.ACCESS_DENIED));
    }
    
    console.log('Deleting post with id:', req.params.id);
    
    await postRepo.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      error: 'Failed to delete post',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user) {
      return res.status(404).json(createErrorResponse(ErrorMessages.USER_NOT_FOUND));
    }

    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = commentRepo.create({
      content: req.body.content,
      postId: req.params.postId,
      authorId: req.user.id,
      authorName: user.name,
      timestamp: new Date()
    });
    
    const savedComment = await commentRepo.save(comment);
    res.json(savedComment);
    console.log('Added comment:', savedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};
