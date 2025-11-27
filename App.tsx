import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, ChefHat, Sparkles } from 'lucide-react';
import { AppState, MenuAnalysisResult } from './types';
import { analyzeMenuImage } from './services/geminiService';
import DishCard from './components/DishCard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<MenuAnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Basic validation
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }

      setErrorMsg(null);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImagePreview(base64);
        setAppState(AppState.ANALYZING);
        
        try {
          const analysis = await analyzeMenuImage(base64);
          setResult(analysis);
          setAppState(AppState.RESULTS);
        } catch (err) {
          console.error(err);
          setErrorMsg("ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง");
          setAppState(AppState.ERROR);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setImagePreview(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={handleReset} role="button">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              NutriScan
            </h1>
          </div>
          {appState === AppState.RESULTS && (
             <button 
               onClick={handleReset}
               className="text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors"
             >
               สแกนใหม่
             </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* State: IDLE - Upload Area */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in-up">
            <div className="text-center space-y-3 max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                เช็คแคลอรี่และสารอาหาร<br/>
                <span className="text-emerald-600">จากรูปเมนูอาหาร</span>
              </h2>
              <p className="text-gray-500 text-lg">
                ถ่ายรูปเมนูหรืออัพโหลดรูปภาพเพื่อให้ AI ช่วยวิเคราะห์สารอาหาร 5 หมู่และพลังงานให้คุณ
              </p>
            </div>

            <div className="w-full max-w-md">
              <label 
                htmlFor="menu-upload" 
                className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-emerald-300 border-dashed rounded-3xl cursor-pointer bg-white hover:bg-emerald-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="mb-4 p-4 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                    <Camera className="w-10 h-10 text-emerald-600" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-gray-700">แตะเพื่อถ่ายรูป หรือ อัพโหลด</p>
                  <p className="text-sm text-gray-400">รองรับ JPG, PNG (สูงสุด 5MB)</p>
                </div>
                <input 
                  id="menu-upload" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
              </label>
            </div>
            
            {/* Features preview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <span className="text-2xl mb-2">🔥</span>
                    <span className="text-sm font-medium text-gray-600">คำนวณแคลอรี่</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <span className="text-2xl mb-2">🥗</span>
                    <span className="text-sm font-medium text-gray-600">ครบ 5 หมู่</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center col-span-2 md:col-span-1">
                    <span className="text-2xl mb-2">✨</span>
                    <span className="text-sm font-medium text-gray-600">วิเคราะห์ด้วย AI</span>
                </div>
            </div>
          </div>
        )}

        {/* State: ANALYZING - Loading */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
                {imagePreview && (
                    <img 
                        src={imagePreview} 
                        alt="Scanning" 
                        className="w-48 h-48 object-cover rounded-2xl shadow-lg opacity-50 blur-sm"
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-emerald-600 animate-spin drop-shadow-md" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">กำลังวิเคราะห์เมนู...</h3>
                <p className="text-gray-500">AI กำลังอ่านรายการอาหารและคำนวณสารอาหาร</p>
            </div>
          </div>
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
             <div className="p-4 bg-red-100 rounded-full">
                <Sparkles className="w-12 h-12 text-red-500 rotate-180" />
             </div>
             <h3 className="text-xl font-bold text-gray-800">เกิดข้อผิดพลาด</h3>
             <p className="text-gray-600 text-center max-w-md">{errorMsg}</p>
             <button 
               onClick={handleReset}
               className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
             >
               ลองใหม่อีกครั้ง
             </button>
           </div>
        )}

        {/* State: RESULTS */}
        {appState === AppState.RESULTS && result && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
                        ผลการวิเคราะห์
                    </h2>
                    <p className="text-gray-500">พบ {result.items.length} รายการอาหารจากเมนูของคุณ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.items.map((item, index) => (
                <DishCard key={index} item={item} />
              ))}
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 flex items-start gap-3">
                <div className="mt-0.5 bg-blue-200 p-1 rounded-full">
                    <Sparkles size={12} className="text-blue-700" />
                </div>
                <div>
                    <p className="font-semibold mb-1">หมายเหตุ:</p>
                    <p>ข้อมูลโภชนาการเป็นการประมาณการโดย AI จากชื่อเมนูและภาพ ปริมาณแคลอรี่และสารอาหารจริงอาจแตกต่างกันไปตามสูตรและปริมาณของแต่ละร้าน</p>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;