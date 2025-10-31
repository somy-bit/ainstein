import React, { useEffect, useState } from 'react';
import { KnowledgeFile, UserRole, getErrorMessage } from '../types';
import * as api from "../services/backendApiService";
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FileUploadInput from '../components/prm/FileUploadInput';
import { ICON_SIZE, LARGE_ICON_SIZE } from '../constants';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ProgressBar from '../components/common/ProgressBar';

const KnowledgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;

const PRMKnowledgeBasePage: React.FC = () => {
  const t = useTranslations();
  const { user } = useAuth();
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [previewFile, setPreviewFile] = useState<KnowledgeFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<KnowledgeFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getKnowledgeFiles();
      setFiles(data);
    } catch (err) {
      console.error("Error fetching knowledge files:", err);
      setError((err as Error).message || "Failed to fetch knowledge files.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (user?.role !== UserRole.ORGANIZATION || !user.name || !user.organizationId) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress for demo
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);
      
      await api.uploadKnowledgeFile(file);
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => setUploadProgress(0), 1000);
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(t('error') + ": " + (error as Error).message);
    }
    
    setIsUploading(false);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim() || user?.role !== UserRole.ORGANIZATION || !user.name || !user.organizationId) return;
    setIsUploading(true);
    try {
        const url = new URL(linkUrl);
        const newFileData: Omit<KnowledgeFile, 'id' | 'uploadDate' | 'uploader'> = {
            name: url.hostname, // Simple name from URL
            type: 'link',
            size: 0,
            url: linkUrl,
            organizationId: user.organizationId,
        };
        await api.addKnowledgeFile(newFileData, user.name);
        fetchFiles(); // Refetch
        setLinkUrl('');
    } catch (error) {
        console.error("Error adding link:", error);
        alert(t('error') + ": Please enter a valid URL. " + getErrorMessage(error));
    }
    setIsUploading(false);
  };

  const handleDownloadFile = async (file: KnowledgeFile) => {
    try {
      if (file.url) {
        window.open(file.url, '_blank');
      } else {
        await api.downloadKnowledgeFile(file.id, file.name);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteKnowledgeFile(fileToDelete.id);
      setFileToDelete(null);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const isPartnerRole = user?.role === UserRole.PARTNER_SI || user?.role === UserRole.PARTNER_ISV;
  const pageTitle = user?.role === UserRole.ORGANIZATION ? t('knowledgeBaseOrg') : t('knowledgeBase');

  if (loading && files.length === 0) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }
  
  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{pageTitle}</h1>

      {user?.role === UserRole.ORGANIZATION && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('uploadFile')}</h2>
                <FileUploadInput onFileUpload={handleFileUpload} />
                {isUploading && (
                    <div className="mt-4">
                        <ProgressBar 
                            progress={uploadProgress} 
                            label="Uploading file..." 
                            className="mb-2"
                        />
                    </div>
                )}
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
                 <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('addFromLink')}</h2>
                 <form onSubmit={handleAddLink} className="space-y-3">
                     <input 
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder={t('enterUrl')}
                        className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary"
                        required
                     />
                     <Button type="submit" className="w-full" disabled={isUploading || !linkUrl.trim()}>
                        {isUploading ? <LoadingSpinner size="sm" /> : t('addLink')}
                     </Button>
                 </form>
            </div>
        </div>
      )}
      
      <div className="bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
            {isPartnerRole ? t('viewKnowledgeBase') : t('availableFiles')}
        </h2>
        {files.length > 0 ? (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                <tr>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('fileName')}</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('fileType')}</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t('fileSize')}</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">{t('uploadDate')}</th>
                    {user?.role === UserRole.ORGANIZATION && <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden xl:table-cell">{t('uploader')}</th>}
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('actions')}</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                {files.map((file, index) => (
                    <tr key={file.id} className="hover:bg-slate-50 transition-colors opacity-0 animate-fadeInUp" style={{ animationDelay: `${index * 30}ms`}}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-primary hover:underline cursor-pointer">
                        {file.name}
                        <div className="text-xs text-slate-500 md:hidden">{file.type}</div>
                        <div className="text-xs text-slate-500 sm:hidden">{formatFileSize(file.size)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{file.type}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">{formatFileSize(file.size)}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden lg:table-cell">{new Date(file.uploadDate).toLocaleDateString()}</td>
                    {user?.role === UserRole.ORGANIZATION && <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden xl:table-cell">{file.uploader}</td>}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1 sm:space-x-2">
                        {file.url ? (
                            <div className="flex space-x-1">
                                <Button size="sm" variant="secondary" onClick={() => setPreviewFile(file)}>{t('preview')}</Button>
                                <button 
                                    onClick={() => handleDownloadFile(file)}
                                    className="text-primary hover:text-primary-dark transition-colors p-1" 
                                    title="Download"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                             <button 
                                onClick={() => handleDownloadFile(file)}
                                className="text-primary hover:text-primary-dark transition-colors p-1" 
                                title="Download"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </button>
                        )}
                        {user?.role === UserRole.ORGANIZATION && (
                        <button 
                            onClick={() => setFileToDelete(file)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1" 
                            title="Delete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.478-.397L12 4.646M12 4.646l-1.127-1.082A48.349 48.349 0 015.026 2.75M12 4.646L12.008 17" />
                            </svg>
                        </button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        ) : (
            !loading && 
            <EmptyState 
                icon={<KnowledgeIcon />}
                title={t('noFilesUploaded')}
                message={t('Get started by uploading documents, presentations, or adding helpful links for your partners.')}
            />
        )}
      </div>

       {previewFile && (
        <Modal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} title={previewFile.name}>
            <div className="w-full aspect-video">
                <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <Modal
          isOpen={!!fileToDelete}
          onClose={() => setFileToDelete(null)}
          title="Delete File"
        >
          <div className="p-4">
            <p className="mb-4">Are you sure you want to delete "{fileToDelete.name}"? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={() => setFileToDelete(null)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteFile}
                variant="danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PRMKnowledgeBasePage;