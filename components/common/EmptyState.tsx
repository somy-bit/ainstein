
import React, { ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    message: string;
    action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
    return (
        <div className="text-center py-12 sm:py-16 px-4 bg-white rounded-lg shadow-md border border-slate-200 opacity-0 animate-fadeInUp">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-light/20 text-primary">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{message}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export default EmptyState;