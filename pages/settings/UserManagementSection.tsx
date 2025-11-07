
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserCreationData } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
// FIX: Replaced deprecated imports from mockPrmDataService with api.
import * as api from "../../services/backendApiService";
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { ICON_SIZE } from '../../constants';
import { useSubscriptionLimits } from '../../hooks/useSubscriptionLimits';

interface UserManagementSectionProps {
    organizationId: string;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({ organizationId }) => {
    const t = useTranslations();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const limitStatus = useSubscriptionLimits(organizationId);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        // FIX: Replaced mock function with apiService call and client-side filtering.
        const allUsersInOrg = await api.getUsersByOrg(organizationId);
        const partnerManagers = allUsersInOrg.filter(u => u.role === UserRole.PARTNER_MANAGER);
        setUsers(partnerManagers);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [organizationId]);
    
    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ role: UserRole.PARTNER_MANAGER, organizationId, isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData(user);
        setIsModalOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };
    
    const handleToggleActive = async (user: User) => {
        await api.updateUser(user.id, { isActive: !user.isActive });
        fetchUsers();
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        setIsSubmitting(true);
        try {
            await api.deleteUser(userToDelete.id);
            await api.updateSubscriptionUsage(organizationId, 'partnerManagers', -1);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
        setIsSubmitting(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({...prev, [name]: value }));
        }
    };
    
    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingUser) { // Update
                await api.updateUser(editingUser.id, formData);
            } else { // Create
                const newUser: UserCreationData = {
                    ...formData,
                    username: formData.email, // Use email as username for simplicity
                    password: formData.password || '', // Use provided password
                    organizationId: formData.organizationId || '',
                    isActive: formData.isActive !== undefined ? formData.isActive : true,
                    mustChangePassword: true // Always require password change on first login
                };
                await api.addUser(newUser);
            }
            alert(t('userSavedSuccess'));
            setIsModalOpen(false);
            fetchUsers();
        } catch(error) {
            console.error(error);
            alert(t('errorSavingUser'));
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{t('managePartnerManagers')}</h3>
                    <p className="text-sm text-slate-500 max-w-xl">{t('partnerManagerInfo')}</p>
                    {!limitStatus.loading && (
                        <p className="text-xs text-slate-600 mt-1">
                            {limitStatus.partnerManagersUsed}/{limitStatus.partnerManagersLimit} partner managers used
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Button 
                        onClick={openCreateModal} 
                        disabled={!limitStatus.canAddPartnerManagers || limitStatus.loading}
                        leftIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.5 21c-2.305 0-4.408-.867-6-2.295z" />
                            </svg>
                        } 
                        className="w-full sm:w-auto"
                    >
                        {t('createNewUser')}
                    </Button>
                    {!limitStatus.canAddPartnerManagers && !limitStatus.loading && (
                        <p className="text-xs text-red-600 text-right">
                            Partner manager limit reached ({limitStatus.partnerManagersLimit}). 
                            {limitStatus.subscription?.planName === 'Free Trial' ? ' Upgrade to add more.' : ' Contact support to increase limit.'}
                        </p>
                    )}
                </div>
            </div>

             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                     <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4"><LoadingSpinner/></td></tr>
                        ) : users.map(user => (
                            <tr key={user.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{user.name} {user.lastNamePaternal}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{user.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.isActive ? t('active') : t('blocked')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                     <button onClick={() => openEditModal(user)} className="text-primary hover:underline">{t('editPartner')}</button>
                                     <button onClick={() => handleToggleActive(user)} className="text-yellow-600 hover:underline">{user.isActive ? t('blockPartner') : t('activatePartner')}</button>
                                     <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                     </tbody>
                </table>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? t('editPartner') : t('createNewUser')}>
                <form onSubmit={handleSaveUser} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">{t('firstName')}</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md" required/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('lastNamePaternal')}</label>
                            <input type="text" name="lastNamePaternal" value={formData.lastNamePaternal || ''} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('lastNameMaternal')}</label>
                        <input type="text" name="lastNameMaternal" value={formData.lastNameMaternal || ''} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('email')}</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md" required/>
                    </div>
                    {!editingUser && (
                        <div>
                            <label className="block text-sm font-medium">Temporary Password</label>
                            <input type="password" name="password" value={formData.password || ''} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md" required placeholder="Set temporary password for user"/>
                            <p className="text-xs text-slate-500 mt-1">User will be required to change this password on first login</p>
                        </div>
                    )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">{t('cellNumber')}</label>
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('country')}</label>
                            <input type="text" name="country" value={formData.country || ''} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md"/>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label className="block text-sm font-medium">{t('userStatus')}:</label>
                        <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleFormChange} className="h-5 w-5 rounded"/>
                        <span className="text-sm">{formData.isActive ? t('active') : t('blocked')}</span>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? <LoadingSpinner size="sm"/> : t('saveUser')}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete User">
                <div className="space-y-4">
                    <p>Are you sure you want to delete <strong>{userToDelete?.name} {userToDelete?.lastNamePaternal}</strong>?</p>
                    <p className="text-sm text-red-600">This action cannot be undone and will reduce your partner manager quota by 1.</p>
                    <div className="flex justify-end space-x-3">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleDeleteUser} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                            {isSubmitting ? <LoadingSpinner size="sm"/> : 'Delete'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagementSection;