
import React, { useState, useCallback } from 'react';

declare var heic2any: any;

interface ImageUploaderProps {
    onFileSelect: (data: { base64: string; mimeType: string; name: string } | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    /**
     * بروتوكول Amr Ai المطور لمعالجة الصور (Quantum Vision Support)
     * يقوم بتحويل صيغ HEIC الخاصة بالأيفون إلى JPEG تلقائياً
     */
    const processImage = async (file: File): Promise<{ base64: string; mimeType: string }> => {
        let activeFile = file;

        // دعم تحويل HEIC/HEIF برمجياً
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic') {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });
                activeFile = new File([Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob], 
                                     file.name.replace(/\.[^/.]+$/, ".jpg"), 
                                     { type: "image/jpeg" });
            } catch (e) {
                console.error("HEIC Conversion Failed:", e);
                throw new Error("فشل تحويل صيغة HEIC؛ يرجى التقاط لقطة شاشة (Screenshot) للصورة ومحاولة رفعها.");
            }
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        reject(new Error("نظام الرسم معطل في متصفحك."));
                        return;
                    }

                    const MAX_SIZE = 1600; 
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    try {
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                        const base64 = dataUrl.split(',')[1];
                        resolve({ base64, mimeType: 'image/jpeg' });
                    } catch (e) {
                        reject(new Error("فشل معالجة الصورة نهائياً."));
                    }
                };

                img.onerror = () => {
                    reject(new Error("تعذر قراءة ملف الصورة. جرب التقاط صورة جديدة أو تحويلها لـ JPG."));
                };

                img.src = event.target?.result as string;
            };

            reader.onerror = () => {
                reject(new Error("فشل الوصول إلى ملف الجهاز."));
            };

            reader.readAsDataURL(activeFile);
        });
    };

    const handleFile = useCallback(async (file: File) => {
        if (!file) return;
        
        setIsCompressing(true);
        try {
            const { base64, mimeType } = await processImage(file);
            
            onFileSelect({ base64, mimeType, name: file.name });
            setFileName(file.name);
            setPreview(`data:${mimeType};base64,${base64}`);
        } catch (error: any) {
            console.error("Amr Ai Vision Error:", error);
            alert(`⚠️ تنبيه Amr Ai: ${error.message}`);
            onFileSelect(null);
        } finally {
            setIsCompressing(false);
        }
    }, [onFileSelect]);

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setFileName(null);
        onFileSelect(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500 bg-sky-500/5 py-2 rounded-lg border border-sky-500/10">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>نظام Amr Ai Vision يدعم الآن صور iPhone (HEIC) بجميع أنواعها</span>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                className={`cursor-pointer p-10 text-center rounded-[32px] bg-gray-950/60 border-2 border-dashed ${isDragOver ? 'border-sky-500 bg-sky-900/20' : 'border-gray-800 hover:border-sky-500/40'} transition-all duration-500 relative group overflow-hidden`}
            >
                <input
                    type="file"
                    id="fileInput"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={(e) => { if(e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                
                {isCompressing && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-sky-400 font-black tracking-widest text-xs uppercase animate-pulse">Amr Ai: Decoding All Formats...</span>
                    </div>
                )}
                
                {preview ? (
                    <div className="relative z-10 animate-enter">
                        <img src={preview} alt="معاينة" className="max-h-80 mx-auto rounded-2xl shadow-2xl border border-white/10" />
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <span className="text-green-400 font-black text-sm bg-green-950/30 px-4 py-2 rounded-full border border-green-500/20">
                                ✅ الصورة جاهزة للتحليل
                            </span>
                            <button onClick={handleRemove} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2 rounded-full text-sm font-bold border border-red-500/20 transition-all">تغيير الصورة</button>
                        </div>
                    </div>
                ) : (
                    <label htmlFor="fileInput" className="block relative z-10 cursor-pointer">
                        <div className="w-20 h-20 mx-auto bg-sky-500/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-sky-500/20">
                            <svg className="w-10 h-10 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <p className="text-2xl font-black text-white mb-2">ارفع صورة السؤال هنا</p>
                        <p className="text-gray-500 text-sm font-medium">يدعم جميع أنواع الصور (JPG, PNG, HEIC, WebP)</p>
                    </label>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
