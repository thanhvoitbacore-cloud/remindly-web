import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            
            <div className="space-y-3 w-full max-w-2xl px-4 mt-8 opacity-50 pointer-events-none">
                <div className="h-8 bg-gray-800 rounded-lg w-1/3 animate-pulse" />
                <div className="h-4 bg-gray-800 rounded-lg w-1/2 animate-pulse mb-8" />
                
                <div className="space-y-4">
                    <div className="h-32 bg-gray-900 border border-gray-800 rounded-2xl w-full animate-pulse flex items-center px-6">
                        <div className="h-12 w-12 rounded-full bg-gray-800 shrink-0" />
                        <div className="ml-4 space-y-2 w-full pr-12">
                            <div className="h-4 bg-gray-800 rounded-full w-1/2" />
                            <div className="h-3 bg-gray-800/80 rounded-full w-1/4" />
                        </div>
                    </div>
                    <div className="h-32 bg-gray-900 border border-gray-800 rounded-2xl w-full animate-pulse flex items-center px-6 opacity-70">
                        <div className="h-12 w-12 rounded-full bg-gray-800 shrink-0" />
                        <div className="ml-4 space-y-2 w-full pr-12">
                            <div className="h-4 bg-gray-800 rounded-full w-2/3" />
                            <div className="h-3 bg-gray-800/80 rounded-full w-1/3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
