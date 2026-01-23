import { Link } from "wouter";
import { useCallback, useEffect, useState } from "react";
import { navigate } from 'wouter/use-browser-location';



export const Home: React.FC = () => {

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">

            <div className="max-w-4xl w-full">

                <div className="mb-12">
                    <h1 className="text-8xl font-black text-stone-800 mb-2 tracking-tight">
                        8-Bit React Machine
                    </h1>
                    <div className="h-2 w-64 bg-amber-600" />
                </div>

                {/* Description */}
                <div className="mb-12 flex items-start justify-between gap-8">
                    <div className="space-y-6">
                        <p className="text-2xl text-stone-700 font-medium max-w-2xl">
                            CPU Simulator with assembly language.
                        </p>

                        <div className="grid grid-cols-3 gap-3 max-w-md">
                            <div className="aspect-square bg-emerald-600 rounded" />
                            <div className="aspect-square bg-amber-600 rounded" />
                            <div className="aspect-square bg-stone-600 rounded" />
                        </div>
                    </div>

                    <div className="shrink-0">
                        
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Features */}
                    <ul className="space-y-3 text-stone-700 text-lg">
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-stone-800 rounded-full" />
                            Realtime CPU
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-stone-800 rounded-full" />
                            Assembly language
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-stone-800 rounded-full" />
                            IO Devices
                        </li>
                    </ul>

                    <div className="flex flex-col gap-4">
                        <Link to="/cpu" className="px-16 py-8 bg-stone-900 text-amber-50 text-xl font-bold hover:bg-stone-800 transition-colors w-full">
                            Start Machine
                        </Link>

                        <Link to="/cpu-beta" className="px-16 py-8 bg-stone-900 text-amber-50 text-xl font-bold hover:bg-stone-800 transition-colors w-full">
                            Start Machine (beta)
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link to="/compiler" className="px-16 py-8 bg-stone-900 text-amber-50 text-xl font-bold hover:bg-stone-800 transition-colors w-full">
                            Compile Code
                        </Link>

                        <Link to="/compiler-beta" className="px-16 py-8 bg-stone-900 text-amber-50 text-xl font-bold hover:bg-stone-800 transition-colors w-full">
                            Compile Code (beta)
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}



interface CreateChunkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateChunk: (chunkName: string) => void;
}

const CreateChunkModal = ({ isOpen, onClose, onCreateChunk }: CreateChunkModalProps) => {
    const [chunkName, setChunkName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!chunkName.trim()) {
            return;
        }

        try {
            setIsCreating(true);
            await onCreateChunk(chunkName.trim());
            setChunkName('');
            onClose();
        } catch (error) {
            console.error('Erreur lors de la création du chunk:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        setChunkName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

            <div className="bg-amber-50 border-4 border-stone-800 max-w-md w-full m-4">
                {/* En-tête avec style World3 */}
                <div className="px-6 py-4 bg-stone-800">
                    <h2 className="text-xl font-black text-amber-50">
                        CREATE NEW CHUNK
                    </h2>
                    <div className="h-1 w-16 bg-amber-600 mt-2" />
                </div>

                {/* Contenu */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label
                            htmlFor="chunkName"
                            className="block text-sm font-bold text-stone-800 mb-2 uppercase tracking-wide"
                        >
                            Chunk Name
                        </label>
                        <input
                            id="chunkName"
                            type="text"
                            value={chunkName}
                            onChange={(e) => setChunkName(e.target.value)}
                            placeholder="My awesome chunk"
                            className="w-full px-4 py-3 border-2 border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition-colors font-medium"
                            disabled={isCreating}
                            autoFocus
                            maxLength={50}
                        />
                        <div className="text-xs text-stone-600 mt-1 font-medium">
                            {chunkName.length}/50 characters
                        </div>
                    </div>

                    {/* Aperçu */}
                    {chunkName.trim() && (
                        <div className="mb-6 p-4 bg-stone-200 border-2 border-stone-300">
                            <div className="text-sm text-stone-600 mb-2 font-bold uppercase tracking-wide">Preview:</div>
                            <div className="font-bold text-stone-800 text-lg">
                                🏗️ {chunkName.trim()}
                            </div>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-4 py-3 border-2 border-stone-300 text-stone-800 font-bold hover:bg-stone-100 transition-colors"
                            disabled={isCreating}
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-stone-900 text-amber-50 font-bold hover:bg-stone-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!chunkName.trim() || isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-amber-50 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    CREATING...
                                </>
                            ) : (
                                'CREATE CHUNK'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

