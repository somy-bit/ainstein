
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { Post, Partner, User } from '../types';
// FIX: Replaced deprecated imports from mockPrmDataService with api.
import * as api from "../services/backendApiService";
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import PostCard from '../components/prm_social/PostCard';
import Modal from '../components/common/Modal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import EmptyState from '../components/common/EmptyState';

const PartnerNetworkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" /></svg>;

const PartnerNetworkPage: React.FC = () => {
    const { user } = useAuth();
    const t = useTranslations();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    // Moderation state
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [editedContent, setEditedContent] = useState('');
    
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const fetchedPosts = await api.getPosts();
            
            if (user?.organizationId) {
                // Get all users from the same organization
                const orgUsers = await api.getUsersByOrg(user.organizationId);
                const orgUserIds = orgUsers.map((u: User) => u.id);
                
                // Filter posts by authors from the same organization
                const filteredPosts = fetchedPosts.filter((post: Post) => 
                    orgUserIds.includes(post.authorId)
                );
                setPosts(filteredPosts);
            } else {
                setPosts(fetchedPosts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        }
        setLoading(false);
    };
    
    useEffect(() => {
        fetchPosts();
    }, []);
    
    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !user) return;
        
        setPosting(true);
        try {
            // In a real app, user might not be a partner, so check role. Here we assume all users posting are findable partners.
            let authorProfile: Partner | null = null;
            try {
                if (user.partnerId) {
                    authorProfile = await api.getPartnerById(user.partnerId);
                }
            } catch (error) {
                console.warn("Could not fetch partner profile for post author logo.", error);
            }
            const newPostData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'> = {
                authorId: user.id,
                authorName: user.name,
                authorLogoUrl: authorProfile?.logoUrl,
                content: newPostContent,
            };
            
            await api.addPost(newPostData);
            setNewPostContent('');
            await fetchPosts(); // Refetch to get latest
        } catch (error) {
            console.error('Error adding post:', error);
            alert('Failed to add post. Please try again.');
        } finally {
            setPosting(false);
        }
    };

    const handleEditClick = (post: Post) => {
        setEditingPost(post);
        setEditedContent(post.content);
    };
    
    const handleSaveEdit = async () => {
        if (!editingPost || !editedContent.trim()) return;
        setPosting(true);
        await api.updatePost(editingPost.id, editedContent);
        setEditingPost(null);
        setEditedContent('');
        await fetchPosts();
        setPosting(false);
    };
    
    const handleDeleteClick = (post: Post) => {
        setPostToDelete(post);
    };

    const handleAddComment = async (postId: string, content: string) => {
        try {
            await api.addComment(postId, content);
            await fetchPosts(); // Refresh posts to show new comment
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        
        setPosting(true);
        try {
            await api.deletePost(postToDelete.id);
            setPostToDelete(null);
            await fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setPosting(false);
        }
    };


    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{t('partnerNetwork')}</h1>
            
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Create Post */}
                <div className="bg-white p-4 rounded-lg shadow-lg">
                    <form onSubmit={handlePostSubmit}>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder={t('whatsOnYourMind')}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows={3}
                            disabled={posting}
                        />
                        <div className="text-right mt-2">
                            <Button type="submit" disabled={posting || !newPostContent.trim()}>
                                {posting ? <LoadingSpinner size="sm"/> : t('post')}
                            </Button>
                        </div>
                    </form>
                </div>
                
                {/* Community Feed */}
                <div className="space-y-4">
                     <h2 className="text-xl font-semibold text-slate-700">{t('communityFeed')}</h2>
                    {posts.length > 0 ? posts.map((post, index) => (
                        <div key={post.id} className="opacity-0 animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                             <PostCard 
                                post={post} 
                                onEdit={handleEditClick} 
                                onDelete={handleDeleteClick}
                                onAddComment={handleAddComment}
                            />
                        </div>
                    )) : (
                        <EmptyState 
                            icon={<PartnerNetworkIcon />}
                            title="The Community is Quiet"
                            message="There are no posts yet. Be the first to share something with the network!"
                        />
                    )}
                </div>
            </div>
            
            {/* Edit Post Modal */}
            <Modal isOpen={!!editingPost} onClose={() => setEditingPost(null)} title={t('editPost')}>
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    rows={5}
                />
                <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={() => setEditingPost(null)}>{t('cancel')}</Button>
                    <Button onClick={handleSaveEdit} disabled={posting}>{posting ? <LoadingSpinner size="sm" /> : t('confirm')}</Button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <ConfirmationModal
                    isOpen={!!postToDelete}
                    onClose={() => setPostToDelete(null)}
                    onConfirm={confirmDeletePost}
                    title={t('deletePost')}
                    message={t('confirmDeletePostMessage')}
                    confirmButtonVariant="danger"
                    isLoading={posting}
                />
            )}
        </div>
    );
};

export default PartnerNetworkPage;