import { useState } from "react";
import Head from 'next/head';

export default function Home() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [bgColor, setBgColor] = useState('transparent');

  const colors = [
    { name: 'Transparent', value: 'transparent', class: 'bg-checkerboard' },
    { name: 'White', value: '#ffffff', class: 'bg-white' },
    { name: 'Black', value: '#000000', class: 'bg-black' },
    { name: 'Red', value: '#ff0000', class: 'bg-red-500' },
    { name: 'Blue', value: '#2563eb', class: 'bg-blue-600' },
  ];

  async function handleFile(file) {
    if (!file) return;

    setProcessedImage(null);
    setIsProcessing(true);
    setBgColor('transparent');
    setOriginalImage(URL.createObjectURL(file));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: buffer,
        headers: { 'Content-Type': 'application/octet-stream' },
      });

      if (!response.ok) throw new Error("API call failed");

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      setProcessedImage(resultUrl);

    } catch (error) {
      console.error(error);
      alert("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  }

  function onChange(e) {
    handleFile(e.target.files[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDownload() {
    if (!processedImage) return;

    if (bgColor === 'transparent') {
      const a = document.createElement("a");
      a.href = processedImage;
      a.download = "splicer-result.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const img = new Image();
    img.src = processedImage;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "splicer-result.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 flex flex-col">
      
      <Head>
        <title>Photo Splicer | AI Background Studio</title>
        <meta name="description" content="Remove backgrounds instantly with Photo Splicer" />
      </Head>

      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-1.414a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Photo Splicer</span>
          </div>
          <a href="#" className="text-xs font-mono text-white/40 border border-white/10 px-3 py-1 rounded hover:bg-white/5 transition">
            v1.0
          </a>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 w-full">
        
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
            Remove Backgrounds <br className="hidden md:block" />
            <span className="text-white">Instant & Free</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Upload an image to isolate the subject. Add professional studio backgrounds instantly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          
          {!originalImage ? (
            <label 
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`
                group relative flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all cursor-pointer
                ${isDragging 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white/90">Click to upload or drag & drop</p>
              <p className="text-sm text-white/40 mt-1">PNG, JPG, or WEBP</p>
              <input type="file" className="hidden" accept="image/*" onChange={onChange} />
            </label>

          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="grid md:grid-cols-2 gap-6">
                
                <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3]">
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-medium border border-white/10 z-10">
                    Original
                  </div>
                  <img src={originalImage} className="w-full h-full object-contain p-4" alt="Original" />
                </div>

                <div 
                  className={`relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] transition-all duration-300 ${bgColor === 'transparent' ? 'bg-checkerboard' : ''}`}
                  style={{ backgroundColor: bgColor === 'transparent' ? '' : bgColor }}
                >
                  <div className="absolute top-4 left-4 bg-purple-500/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg z-10">
                    Result
                  </div>
                  
                  {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-purple-200 animate-pulse">Removing background...</p>
                      </div>
                    </div>
                  ) : (
                    processedImage && <img src={processedImage} className="w-full h-full object-contain p-4 z-10 relative" alt="Processed" />
                  )}
                </div>

              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                
                <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                   <span className="text-sm text-white/50 mr-2">Background:</span>
                   
                   {colors.map((c) => (
                     <button
                        key={c.name}
                        onClick={() => setBgColor(c.value)}
                        title={c.name}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${c.class} ${bgColor === c.value ? 'border-purple-500 scale-110' : 'border-white/20'}`}
                     />
                   ))}

                   <div className="relative group">
                     <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center overflow-hidden">
                       <input 
                          type="color" 
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                          onChange={(e) => setBgColor(e.target.value)}
                       />
                     </div>
                   </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setOriginalImage(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Reset
                  </button>
                  
                  <button 
                    onClick={handleDownload}
                    disabled={!processedImage || isProcessing}
                    className={`
                      flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all
                      ${!processedImage 
                        ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                        : 'bg-white text-black hover:scale-105 shadow-lg shadow-purple-500/20'
                      }
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {bgColor !== 'transparent' ? 'JPG' : 'PNG'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-white/10 bg-black py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <div>
            <p>&copy; {new Date().getFullYear()} Photo Splicer. All rights reserved.</p>
          </div>
          <div>
            <p>Built by FIsekenegbe</p>
          </div>
        </div>
      </footer>

    </div>
  );
}