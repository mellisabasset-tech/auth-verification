interface GoogleLogoProps {
  size?: 'small' | 'large';
}

export function GoogleLogo({ size = 'large' }: GoogleLogoProps) {
  const isLarge = size === 'large';
  const logoSize = isLarge ? 'text-5xl' : 'text-3xl';
  
  return (
    <div className={`flex items-center ${logoSize} font-normal select-none`}>
      <span className="text-blue-500" style={{ color: '#4285f4' }}>G</span>
      <span className="text-red-500" style={{ color: '#ea4335' }}>o</span>
      <span className="text-yellow-500" style={{ color: '#fbbc05' }}>o</span>
      <span className="text-blue-500" style={{ color: '#4285f4' }}>g</span>
      <span className="text-green-500" style={{ color: '#34a853' }}>l</span>
      <span className="text-red-500" style={{ color: '#ea4335' }}>e</span>
    </div>
  );
}
