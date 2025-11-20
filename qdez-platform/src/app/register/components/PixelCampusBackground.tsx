'use client';

import { useEffect, useRef } from 'react';

export default function PixelCampusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 加载校园图片
    const img = new Image();
    img.src = '/images/qdez_campus.jpg';
    imageRef.current = img;

    // 动画状态
    let animationId: number;
    let frame = 0;

    // 粒子系统
    const leaves: Particle[] = [];      // 柳叶
    const ripples: Ripple[] = [];       // 水波
    const sparkles: Sparkle[] = [];     // 光斑
    const clouds: Cloud[] = [];         // 云朵
    const birds: Bird[] = [];           // 飞鸟

    // 柳叶粒子
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    // 水波涟漪
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }

    // 光斑
    interface Sparkle {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      phase: number;
    }

    // 云朵
    interface Cloud {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      opacity: number;
    }

    // 飞鸟
    interface Bird {
      x: number;
      y: number;
      speed: number;
      wingPhase: number;
      size: number;
    }

    // 初始化粒子
    const initParticles = () => {
      // 初始化柳叶（从两侧飘落）
      for (let i = 0; i < 15; i++) {
        leaves.push({
          x: Math.random() < 0.5 ? Math.random() * 200 : canvas.width - Math.random() * 200,
          y: Math.random() * canvas.height,
          size: 3 + Math.random() * 4,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: 0.3 + Math.random() * 0.5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          opacity: 0.6 + Math.random() * 0.4,
        });
      }

      // 初始化光斑（水面和建筑上）
      for (let i = 0; i < 20; i++) {
        sparkles.push({
          x: Math.random() * canvas.width,
          y: canvas.height * 0.4 + Math.random() * canvas.height * 0.5,
          size: 2 + Math.random() * 3,
          opacity: 0,
          speed: 0.02 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // 初始化云朵
      for (let i = 0; i < 4; i++) {
        clouds.push({
          x: Math.random() * canvas.width,
          y: 20 + Math.random() * 100,
          width: 60 + Math.random() * 80,
          height: 20 + Math.random() * 30,
          speed: 0.1 + Math.random() * 0.2,
          opacity: 0.3 + Math.random() * 0.3,
        });
      }
    };

    // 像素化图片
    const pixelateImage = (pixelSize: number = 6) => {
      if (!imageRef.current || !imageRef.current.complete) return;

      const img = imageRef.current;
      
      // 计算缩放比例以覆盖整个画布
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      // 先绘制原图到临时canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // 像素化处理
      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
          const i = (y * canvas.width + x) * 4;
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }

      // 添加暗色叠加层（让前景更清晰）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // 绘制水波涟漪
    const drawRipples = () => {
      // 随机生成新涟漪
      if (Math.random() < 0.02) {
        ripples.push({
          x: canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
          y: canvas.height * 0.55 + Math.random() * canvas.height * 0.15,
          radius: 0,
          maxRadius: 20 + Math.random() * 30,
          opacity: 0.5,
        });
      }

      // 更新和绘制涟漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += 0.5;
        ripple.opacity = 0.5 * (1 - ripple.radius / ripple.maxRadius);

        if (ripple.radius >= ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    // 绘制柳叶
    const drawLeaves = () => {
      ctx.fillStyle = '#90EE90'; // 浅绿色

      for (const leaf of leaves) {
        // 更新位置
        leaf.x += leaf.speedX + Math.sin(frame * 0.02 + leaf.y * 0.01) * 0.3;
        leaf.y += leaf.speedY;
        leaf.rotation += leaf.rotationSpeed;

        // 重置到顶部
        if (leaf.y > canvas.height + 20) {
          leaf.y = -20;
          leaf.x = Math.random() < 0.5 ? Math.random() * 200 : canvas.width - Math.random() * 200;
        }

        // 绘制像素化柳叶
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.globalAlpha = leaf.opacity;
        
        // 简单的像素叶子形状
        ctx.fillRect(-leaf.size / 2, -leaf.size, leaf.size, leaf.size * 2);
        ctx.fillRect(-leaf.size, -leaf.size / 2, leaf.size * 2, leaf.size);
        
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    // 绘制光斑
    const drawSparkles = () => {
      for (const sparkle of sparkles) {
        sparkle.phase += sparkle.speed;
        sparkle.opacity = Math.abs(Math.sin(sparkle.phase)) * 0.8;

        if (sparkle.opacity > 0.1) {
          ctx.fillStyle = `rgba(255, 255, 200, ${sparkle.opacity})`;
          ctx.fillRect(
            sparkle.x - sparkle.size / 2,
            sparkle.y - sparkle.size / 2,
            sparkle.size,
            sparkle.size
          );
          
          // 十字光芒
          ctx.fillRect(sparkle.x - 1, sparkle.y - sparkle.size, 2, sparkle.size * 2);
          ctx.fillRect(sparkle.x - sparkle.size, sparkle.y - 1, sparkle.size * 2, 2);
        }
      }
    };

    // 绘制云朵
    const drawClouds = () => {
      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        
        // 循环
        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        
        // 像素化云朵形状
        const pixelSize = 6;
        for (let py = 0; py < cloud.height; py += pixelSize) {
          for (let px = 0; px < cloud.width; px += pixelSize) {
            // 椭圆形云朵
            const cx = px - cloud.width / 2;
            const cy = py - cloud.height / 2;
            const inCloud = (cx * cx) / (cloud.width * cloud.width / 4) + 
                           (cy * cy) / (cloud.height * cloud.height / 4) < 1;
            
            if (inCloud && Math.random() > 0.3) {
              ctx.fillRect(cloud.x + px, cloud.y + py, pixelSize, pixelSize);
            }
          }
        }
      }
    };

    // 绘制飞鸟
    const drawBirds = () => {
      // 随机生成飞鸟（低频率）
      if (Math.random() < 0.003 && birds.length < 3) {
        birds.push({
          x: -20,
          y: 50 + Math.random() * 150,
          speed: 1 + Math.random() * 1.5,
          wingPhase: 0,
          size: 4 + Math.random() * 3,
        });
      }

      ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';

      for (let i = birds.length - 1; i >= 0; i--) {
        const bird = birds[i];
        bird.x += bird.speed;
        bird.wingPhase += 0.15;

        // 移出屏幕后移除
        if (bird.x > canvas.width + 20) {
          birds.splice(i, 1);
          continue;
        }

        // 绘制像素鸟（简单V形）
        const wingY = Math.sin(bird.wingPhase) * bird.size;
        
        // 身体
        ctx.fillRect(bird.x, bird.y, bird.size, bird.size / 2);
        
        // 翅膀
        ctx.fillRect(bird.x - bird.size, bird.y - wingY, bird.size, bird.size / 2);
        ctx.fillRect(bird.x + bird.size, bird.y + wingY, bird.size, bird.size / 2);
      }
    };

    // 绘制扫描线效果
    const drawScanlines = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
    };

    // 主动画循环
    const animate = () => {
      // 重绘像素化背景
      pixelateImage(6);

      // 绘制所有动画效果
      drawClouds();
      drawRipples();
      drawLeaves();
      drawSparkles();
      drawBirds();
      drawScanlines();

      frame++;
      animationId = requestAnimationFrame(animate);
    };

    // 图片加载完成后开始动画
    img.onload = () => {
      initParticles();
      animate();
    };

    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
