// Code-built 3D-style gem. Pure SVG + CSS, no image assets.
export function Gem({ size = 340 }: { size?: number }) {
  return (
    <div className="gem" style={{ width: size, height: size }} aria-hidden="true">
      <div className="gem__glow" />
      <div className="gem__ring gem__ring--a" />
      <div className="gem__ring gem__ring--b" />
      <span className="gem__spark gem__spark--1">✦</span>
      <span className="gem__spark gem__spark--2">✦</span>
      <span className="gem__spark gem__spark--3">✦</span>
      <svg className="gem__body" viewBox="0 0 200 220">
        <defs>
          <linearGradient id="gemA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3ffcf" /><stop offset="1" stopColor="#b8ff3c" /></linearGradient>
          <linearGradient id="gemB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9ff7a" /><stop offset="1" stopColor="#8fdc12" /></linearGradient>
          <linearGradient id="gemC" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a6f01d" /><stop offset="1" stopColor="#6fb80a" /></linearGradient>
          <linearGradient id="gemD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fd10c" /><stop offset="1" stopColor="#3f7a03" /></linearGradient>
          <linearGradient id="gemE" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fa507" /><stop offset="1" stopColor="#264d00" /></linearGradient>
          <linearGradient id="gemShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".9" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient>
        </defs>
        {/* crown */}
        <polygon points="55,30 10,80 70,80" fill="url(#gemB)" />
        <polygon points="55,30 70,80 100,30" fill="url(#gemA)" />
        <polygon points="100,30 70,80 130,80" fill="url(#gemB)" />
        <polygon points="100,30 130,80 145,30" fill="url(#gemC)" />
        <polygon points="145,30 130,80 190,80" fill="url(#gemD)" />
        {/* pavilion */}
        <polygon points="10,80 70,80 100,210" fill="url(#gemC)" />
        <polygon points="70,80 130,80 100,210" fill="url(#gemD)" />
        <polygon points="130,80 190,80 100,210" fill="url(#gemE)" />
        {/* edges + shine */}
        <g fill="none" stroke="#f4ffd8" strokeOpacity=".55" strokeWidth=".8" strokeLinejoin="round">
          <polygon points="55,30 145,30 190,80 100,210 10,80" />
          <polyline points="10,80 190,80" />
          <polyline points="55,30 70,80 100,30 130,80 145,30" />
          <polyline points="70,80 100,210 130,80" />
        </g>
        <polygon points="58,34 96,34 72,74" fill="url(#gemShine)" opacity=".75" />
      </svg>
      <div className="gem__shadow" />
    </div>
  );
}
