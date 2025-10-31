
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Partner, Post, UserRole } from '../types';
// FIX: Replaced deprecated imports from mockPrmDataService with api.
import * as api from "../services/backendApiService";
import { useTranslations } from '../hooks/useTranslations';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import PostCard from '../components/prm_social/PostCard';

const PartnerProfilePage: React.FC = () => {
    const { partnerId } = useParams<{ partnerId: string }>();
    const t = useTranslations();
    const { user } = useAuth();
    const [partner, setPartner] = useState<Partner | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [logoError, setLogoError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!partnerId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const partnerData = await api.getPartnerById(partnerId);
                const allPosts = await api.getPosts();
                if (partnerData) {
                    setPartner(partnerData);
                    // This logic assumes posts are authored by users associated with the partner.
                    // A more robust solution would be to get users for the partner first.
                    // For now, we'll filter based on a convention that authorId might be the partnerId for simplicity.
                    const partnerUsers = [user?.id]; // A simple mock, in reality you'd fetch users for this partner
                    setPosts(allPosts.filter(p => partnerUsers.includes(p.authorId)));
                }
            } catch (error) {
                console.error("Error fetching partner profile data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [partnerId, user?.id]);

    const getTierColor = (tier: string) => {
        switch (tier.toLowerCase()) {
            case 'platinum': return 'bg-purple-500 text-white';
            case 'gold': return 'bg-yellow-400 text-slate-800';
            case 'silver': return 'bg-slate-400 text-white';
            case 'bronze': return 'bg-orange-400 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };
    
    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !partner) return;

        setLogoError(null);
        
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setLogoError(t('logoInvalidFileType'));
            return;
        }

        setIsUploadingLogo(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const updatedPartner = await api.updatePartner(partner.id, { logoUrl: base64data });
                if (updatedPartner) {
                    setPartner(updatedPartner);
                    alert(t('logoUploadSuccess'));
                } else {
                    throw new Error("Partner update failed on the server.");
                }
            };
            reader.onerror = () => {
                throw new Error("Failed to read file.");
            };

        } catch (error) {
            console.error("Error uploading logo:", error);
            setLogoError(t('logoUploadError'));
        } finally {
            setIsUploadingLogo(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
    }
    
    if (!partner) {
        return <div className="text-center py-10 text-slate-600">{t('noResultsFound')}</div>;
    }
    
    const isOwnProfile = user?.partnerId === partner.id;
    const canChangeLogo = isOwnProfile && (user?.role === UserRole.PARTNER_SI || user?.role === UserRole.PARTNER_ISV);

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className={`p-6 ${getTierColor(partner.tier)}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                         <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <img 
                                    src={partner.logoUrl || `https://via.placeholder.com/64x64.png?text=${partner.name.charAt(0)}`} 
                                    alt={`${partner.name} logo`} 
                                    className="h-16 w-16 rounded-full object-contain bg-white p-1" 
                                />
                                {canChangeLogo && (
                                    <button 
                                        onClick={handleLogoClick}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300"
                                        aria-label={t('changeLogo')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                        </svg>
                                    </button>
                                )}
                                {isUploadingLogo && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-full">
                                        <LoadingSpinner size="sm" color="text-white"/>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange}
                                    className="hidden" 
                                    accept="image/png, image/jpeg"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold">{partner.name}</h1>
                                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full inline-block mt-1 border border-white/50`}>
                                    {partner.tier} {t('tier')}
                                </span>
                            </div>
                        </div>
                        {!isOwnProfile && (
                            <div className="mt-4 sm:mt-0">
                                <Button variant="ghost" className="bg-white/20 hover:bg-white/40">{t('connect')}</Button>
                            </div>
                        )}
                    </div>
                    {logoError && <p className="text-sm text-red-100 bg-red-500/50 rounded p-2 mt-4 text-center">{logoError}</p>}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* About Section */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                             <h3 className="text-lg font-semibold text-slate-700 mb-2">About</h3>
                             <p className="text-sm text-slate-600">{partner.description || "No description provided."}</p>
                        </div>
                        {/* Activity Feed */}
                        <div>
                             <h3 className="text-lg font-semibold text-slate-700 mb-4">Activity</h3>
                             <div className="space-y-4">
                                {posts.length > 0 ? (
                                    posts.map(post => <PostCard key={post.id} post={post} />)
                                ) : (
                                    <p className="text-sm text-slate-500">No activity yet.</p>
                                )}
                             </div>
                        </div>
                    </div>
                    <div className="md:col-span-1 space-y-4">
                         {/* Details */}
                         <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                             <h3 className="text-lg font-semibold text-slate-700 mb-2">Details</h3>
                             <div className="text-sm"><strong>{t('specialization')}:</strong> <span className="text-slate-600">{partner.specialization}</span></div>
                             <div className="text-sm"><strong>{t('region')}:</strong> <span className="text-slate-600">{partner.region}</span></div>
                             <div className="text-sm"><strong>{t('country')}:</strong> <span className="text-slate-600">{partner.country}</span></div>
                             <div className="text-sm"><strong>{t('contactEmail')}:</strong> <a href={`mailto:${partner.contactEmail}`} className="text-primary hover:underline">{partner.contactEmail}</a></div>
                             {partner.website && <div className="text-sm"><strong>{t('website')}:</strong> <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{partner.website}</a></div>}
                         </div>
                          {/* Badges */}
                         <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-slate-700 mb-3">{t('badges')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {partner.badges && partner.badges.length > 0 ? partner.badges.map(badge => (
                                    <span key={badge} className="bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">{badge}</span>
                                )) : <p className="text-sm text-slate-500">No badges earned yet.</p>}
                            </div>
                         </div>
                         {/* Connections */}
                         <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-slate-700 mb-3">{t('connections')} ({partner.connections?.length || 0})</h3>
                             {/* In a real app, you'd fetch details for these connections */}
                            {partner.connections && partner.connections.length > 0 ? (
                                <p className="text-sm text-slate-500">Connections feature coming soon!</p>
                            ) : <p className="text-sm text-slate-500">No connections yet.</p>}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerProfilePage;