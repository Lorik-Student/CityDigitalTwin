
interface InfoCardProps { 
    pictureUrl?: string;
    title?: string;
    description?: string;
}

export function InfoCard({ pictureUrl, title, description }: InfoCardProps) { 
    if (!title) return null;

    return (
        <div className="absolute left-12 top-1/2 -translate-y-1/2 w-80 max-h-[85vh] overflow-y-auto 
                        bg-[#02090c]/70 backdrop-blur-xl border border-cyan-500/30 
                        rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] p-6 flex flex-col z-50">
            {pictureUrl && (
                <div className="relative mb-5 w-full h-48 rounded-xl overflow-hidden border border-cyan-500/30">
                    <img src={pictureUrl} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02090c] to-transparent"></div>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide">
                {title}
            </h2>
            <div className="w-12 h-[2px] bg-cyan-500 rounded-full mb-4 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            <p className="text-gray-300 leading-relaxed text-sm">
                {description || "No details available."}
            </p>
        </div>
    )
}