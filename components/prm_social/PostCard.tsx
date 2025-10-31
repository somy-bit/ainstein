
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, UserRole, Comment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { ICON_SIZE } from '../../constants';

interface PostCardProps {
    post: Post;
    onEdit?: (post: Post) => void;
    onDelete?: (post: Post) => void;
    onAddComment?: (postId: string, content: string) => Promise<void>;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete, onAddComment }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const t = useTranslations();
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const handleAuthorClick = () => {
        navigate(`/prm/partners/${post.authorId}`);
    };

    const handleCommentSubmit = async () => {
        if (newComment.trim() && onAddComment) {
            setIsSubmittingComment(true);
            try {
                await onAddComment(post.id, newComment.trim());
                setNewComment('');
            } catch (error) {
                console.error('Failed to submit comment:', error);
            } finally {
                setIsSubmittingComment(false);
            }
        }
    };

    const timeSince = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const canModerate = user?.role === UserRole.ORGANIZATION;

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                    <img
                        src={post.authorLogoUrl || 'https://via.placeholder.com/40x40.png?text=P'}
                        alt={`${post.authorName} logo`}
                        className="h-10 w-10 rounded-full object-cover mr-3 cursor-pointer"
                        onClick={handleAuthorClick}
                    />
                    <div>
                        <p className="font-semibold text-slate-800 cursor-pointer hover:underline" onClick={handleAuthorClick}>
                            {post.authorName}
                        </p>
                        <p className="text-xs text-slate-500">{timeSince(post.timestamp)}</p>
                    </div>
                </div>
                 {canModerate && onEdit && onDelete && (
                    <div className="flex items-center space-x-2">
                         <button onClick={() => onEdit && onEdit(post)} className="text-slate-500 hover:text-primary p-1 rounded-full" title={t('editPost')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button onClick={() => onDelete && onDelete(post)} className="text-slate-500 hover:text-red-500 p-1 rounded-full" title={t('deletePost')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.478-.397L12 4.646M12 4.646l-1.127-1.082A48.349 48.349 0 015.026 2.75M12 4.646L12.008 17" /></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Post Content */}
            <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.content}</p>

            {/* Post Actions */}
            <div className="flex justify-between items-center text-slate-500 border-t pt-2">
                <button className="flex items-center space-x-1 hover:text-primary transition-colors p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.865 2.4z" />
                    </svg>
                    <span className="text-sm font-medium">Like ({post.likes})</span>
                </button>
                <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors p-2 rounded-md"
                    onClick={() => setShowComments(!showComments)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 1.76.712 3.373 1.88 4.595L2 18l3.405-1.135A7.962 7.962 0 0010 17c4.418 0 8-3.134 8-7s-3.582-7-8-7zM8 9a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Comment ({post.comments?.length || 0})</span>
                </button>

            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 border-t pt-4">
                    {/* Existing Comments */}
                    {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {post.comments.map((comment) => (
                                <div key={comment.id} className="flex space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-slate-600">
                                                {comment.authorName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-slate-800">
                                                    {comment.authorName}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {timeSince(comment.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                />
                                <button
                                    onClick={handleCommentSubmit}
                                    disabled={!newComment.trim() || isSubmittingComment}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingComment ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;