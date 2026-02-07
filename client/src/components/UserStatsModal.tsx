import { X } from 'lucide-react';
import UserStatsView from './UserStatsView';

interface UserStatsModalProps {
    userId: string;
    onClose: () => void;
}

export default function UserStatsModal({ userId, onClose }: UserStatsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-lg border bg-background p-6 shadow-lg sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                <UserStatsView userId={userId} isAdminView={true} />
            </div>
        </div>
    );
}
