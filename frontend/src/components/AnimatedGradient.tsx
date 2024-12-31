import { useEffect, useRef } from 'react';

interface AnimatedGradientProps {
  colors?: string[];
}

const AnimatedGradient = ({ colors = ['#833ab4', '#fd1d1d', '#fcb045'] }: AnimatedGradientProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let gradientAngle = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.max(canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(
        centerX + Math.cos(gradientAngle) * radius,
        centerY + Math.sin(gradientAngle) * radius,
        centerX + Math.cos(gradientAngle + Math.PI * 0.9) * radius,
        centerY + Math.sin(gradientAngle + Math.PI * 0.9) * radius
      );

      // Add color stops
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });

      // Fill canvas with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update angle for next frame
      gradientAngle += 0.02;

      // Request next frame
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ opacity: 0.8 }}
    />
  );
};

export default AnimatedGradient; 