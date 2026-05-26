import React, { useState, useEffect } from 'react';
import { X, Trash2, Layers } from 'lucide-react';
import { CleanedProperty } from '../../assets/mockData';

interface CompareDockProps {
  selectedProperties: CleanedProperty[];
  toggleSelectProperty: (prop: CleanedProperty) => void;
  setSelectedProperties: React.Dispatch<React.SetStateAction<CleanedProperty[]>>;
  allProperties: CleanedProperty[];
  onCompareClick: () => void;
  onCloseDock?: () => void;
}

export default function CompareDock({
  selectedProperties,
  toggleSelectProperty,
  setSelectedProperties,
  allProperties,
  onCompareClick,
  onCloseDock
}: CompareDockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Listen to window-level drag actions to slide the dock up dynamically
  useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (selectedProperties.length < 3) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Support text/plain payload containing the property ID
    const propertyId = e.dataTransfer.getData('text/plain');
    if (!propertyId) return;

    const found = allProperties.find(p => p.property_id === propertyId);
    if (!found) return;

    if (selectedProperties.some(p => p.property_id === found.property_id)) {
      return; // Already added
    }

    if (selectedProperties.length >= 3) {
      alert('You can select a maximum of 3 properties for comparison.');
      return;
    }

    setSelectedProperties(prev => [...prev, found]);
  };

  const isVisible = isDragging || selectedProperties.length > 0;
  const slots = [0, 1, 2];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-3xl glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all duration-500 ease-out shadow-2xl border border-theme-border ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-28 opacity-0 pointer-events-none'
      } ${isDragOver ? 'border-theme-accent/60 bg-theme-accent-muted/20 shadow-theme-accent-muted/10' : ''}`}
    >
      {onCloseDock && (
        <button
          onClick={onCloseDock}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-theme-card border border-theme-border text-theme-text-muted hover:text-theme-text-light transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 z-[10000]"
          title="Close Compare Queue"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-theme-accent animate-pulse" />
          <span>Compare Queue</span>
        </span>
        <span className="text-[10px] text-theme-text-muted font-mono">
          {selectedProperties.length} of 3 properties selected
        </span>
      </div>

      {/* 3 Interactive Slots */}
      <div className="flex gap-3 flex-wrap">
        {slots.map((index) => {
          const prop = selectedProperties[index];
          
          if (prop) {
            return (
              <div 
                key={prop.property_id}
                className="relative w-32 h-16 rounded-xl border border-theme-border/60 bg-black/30 overflow-hidden flex items-center gap-2 p-1.5 animate-in zoom-in-95 duration-200 group"
              >
                {prop.image_url ? (
                  <img 
                    src={prop.image_url} 
                    alt={prop.title} 
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-theme-border/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-theme-btn flex items-center justify-center flex-shrink-0 text-theme-text-muted text-[10px]">
                    Prop
                  </div>
                )}
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-theme-text-light truncate line-clamp-1 block leading-tight">{prop.title}</span>
                  <span className="text-[8px] text-theme-accent font-mono font-bold mt-0.5 block leading-tight">
                    {prop.transaction_type === 'Rent'
                      ? `₹${prop.price.toLocaleString()}/mo`
                      : `₹${(prop.price / 100000).toFixed(1)}L`
                    }
                  </span>
                </div>
                <button
                  onClick={() => toggleSelectProperty(prop)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-950/80 hover:text-rose-400 transition-all cursor-pointer shadow-md"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          }

          // Empty Slot
          return (
            <div 
              key={`empty-${index}`}
              className={`w-32 h-16 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                isDragging 
                  ? 'border-theme-accent/60 bg-theme-accent-muted/10 text-theme-accent animate-pulse' 
                  : 'border-theme-border/40 bg-black/10 text-theme-text-muted/40'
              }`}
            >
              <span className="text-[8px] font-mono tracking-wider font-bold">
                {isDragging ? 'DROP HERE' : 'SLOT EMPTY'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {selectedProperties.length > 0 && (
          <button
            onClick={() => setSelectedProperties([])}
            className="p-2 text-theme-text-muted hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-950/40 rounded-xl transition-all cursor-pointer font-bold text-xs flex items-center gap-1"
            title="Clear Queue"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono uppercase tracking-widest text-[9px]">Clear</span>
          </button>
        )}
        <button
          onClick={onCompareClick}
          disabled={selectedProperties.length < 2}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
            selectedProperties.length >= 2
              ? 'bg-theme-accent hover:opacity-90 text-theme-bg cursor-pointer active:scale-95'
              : 'bg-theme-btn border border-theme-border text-theme-text-muted opacity-50 cursor-not-allowed'
          }`}
        >
          <span>Compare</span>
          <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] text-theme-text font-black font-mono">
            {selectedProperties.length}
          </span>
        </button>
      </div>
    </div>
  );
}
