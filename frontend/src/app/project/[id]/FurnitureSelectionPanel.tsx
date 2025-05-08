import React from 'react';
import { Furniture } from './types';

interface FurnitureSelectionPanelProps {
    show: boolean;
    onClose: () => void;
    availableFurniture: Furniture[];
    addFurnitureError: string | null;
    handleAddFurniture: (furniture: Furniture) => void;
}

const FurnitureSelectionPanel: React.FC<FurnitureSelectionPanelProps> = ({
                                                                             show,
                                                                             onClose,
                                                                             availableFurniture,
                                                                             addFurnitureError,
                                                                             handleAddFurniture,
                                                                         }) => {
    if (!show) return null;

    return (
        <div className="absolute left-4 top-16 z-20 bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-xl p-4 max-h-[70vh] overflow-y-auto w-64 transition-all duration-300 font-sans">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100 tracking-tight">Add Furniture</h3>
                <button
                    className="text-gray-400 hover:text-gray-100 text-xl transition-all duration-200 transform hover:scale-110"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            {addFurnitureError && (
                <div className="bg-red-900/80 text-red-200 p-2 rounded-lg mb-4 text-sm tracking-tight">
                    {addFurnitureError}
                </div>
            )}

            {availableFurniture.length === 0 ? (
                <p className="text-gray-400 text-sm tracking-tight">No furniture available.</p>
            ) : (
                <div className="space-y-3">
                    {availableFurniture.map(furniture => (
                        <div
                            key={furniture.id}
                            className="bg-gray-700/80 p-3 rounded-lg cursor-pointer hover:bg-gray-600/80 transition-all duration-200 transform hover:scale-102"
                            onClick={() => handleAddFurniture(furniture)}
                        >
                            <div className="w-full h-28 mb-2 bg-gray-600/50 rounded-lg overflow-hidden flex items-center justify-center">
                                {furniture.thumbnail_path ? (
                                    <img
                                        src={`http://localhost:8080/${furniture.thumbnail_path.replace('objects/', '')}`}
                                        alt={furniture.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                        }}
                                    />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-100 tracking-tight">{furniture.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FurnitureSelectionPanel;