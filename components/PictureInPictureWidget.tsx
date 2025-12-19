'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PictureInPictureWidgetProps {
  timeRemaining: number;
  distractionCount: number;
  onLogDistraction: () => void;
  onAbandon: () => void;
}

interface ButtonArea {
  x: number;
  y: number;
  width: number;
  height: number;
  action: 'distraction' | 'abandon';
}

export function PictureInPictureWidget({
  timeRemaining,
  distractionCount,
  onLogDistraction,
  onAbandon,
}: PictureInPictureWidgetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInPiP, setIsInPiP] = useState(false);
  const buttonAreasRef = useRef<ButtonArea[]>([]);
  const lastRenderTimeRef = useRef<string>('');
  const lastDistractionCountRef = useRef<number>(-1);
  const staticRenderedRef = useRef(false);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Render static elements (only once)
  const renderStaticElements = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || staticRenderedRef.current) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.fillText('Pomodoro', 10, 20);

    // Draw buttons area (static)
    const buttonY = 110;
    const buttonHeight = 30;
    const buttonSpacing = 5;
    const buttonWidth = (canvas.width - buttonSpacing * 3) / 2;

    // Store button areas for click detection
    buttonAreasRef.current = [
      {
        x: buttonSpacing,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        action: 'distraction',
      },
      {
        x: buttonWidth + buttonSpacing * 2,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        action: 'abandon',
      },
    ];

    // Distraction button background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(buttonSpacing, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = '#404040';
    ctx.strokeRect(buttonSpacing, buttonY, buttonWidth, buttonHeight);

    // Abandon button background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(buttonWidth + buttonSpacing * 2, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = '#dc2626';
    ctx.strokeRect(buttonWidth + buttonSpacing * 2, buttonY, buttonWidth, buttonHeight);

    staticRenderedRef.current = true;
  }, []);

  // Update only dynamic elements (timer, distraction count, button text)
  const updateDynamicElements = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTime = formattedTime;
    const timeChanged = currentTime !== lastRenderTimeRef.current;
    const distractionChanged = distractionCount !== lastDistractionCountRef.current;

    if (!timeChanged && !distractionChanged) {
      return;
    }

    // Clear only the timer area (approximately 40-80px height)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 40, canvas.width, 50);

    // Redraw timer if it changed
    if (timeChanged) {
      ctx.fillStyle = '#ededed';
      ctx.font = 'bold 32px monospace';
      const timeWidth = ctx.measureText(formattedTime).width;
      ctx.fillText(formattedTime, (canvas.width - timeWidth) / 2, 70);
      lastRenderTimeRef.current = currentTime;
    }

    // Clear and redraw distraction count area
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 80, canvas.width, 15);

    if (distractionCount > 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Distractions: ${distractionCount}`, 10, 90);
    }

    // Update button text if distraction count changed
    if (distractionChanged) {
      const buttonY = 110;
      const buttonSpacing = 5;
      const buttonWidth = (canvas.width - buttonSpacing * 3) / 2;

      // Clear distraction button text area
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(buttonSpacing + 5, buttonY + 5, buttonWidth - 10, 20);

      // Redraw distraction button text
      ctx.fillStyle = '#ededed';
      ctx.font = '12px sans-serif';
      ctx.fillText(`D (${distractionCount})`, buttonSpacing + 10, buttonY + 20);

      // Redraw abandon button text (static, but redraw for consistency)
      ctx.fillStyle = '#dc2626';
      ctx.font = '12px sans-serif';
      ctx.fillText('A', buttonWidth + buttonSpacing * 2 + 10, buttonY + 20);

      lastDistractionCountRef.current = distractionCount;
    }
  }, [formattedTime, distractionCount]);

  // Initialize canvas and stream
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // Render static elements once
    renderStaticElements();

    // Set up stream with higher FPS for smoother video
    const stream = canvas.captureStream(30); // 30 FPS for smooth playback
    video.srcObject = stream;
    video.play().catch(() => {
      // Ignore play() errors - they're often just warnings
    });

    return () => {
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      staticRenderedRef.current = false;
    };
  }, [renderStaticElements]);

  // Update dynamic elements when time or distraction count changes
  useEffect(() => {
    updateDynamicElements();
  }, [updateDynamicElements]);

  // Handle PiP events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsInPiP(true);
    const handleLeavePiP = () => setIsInPiP(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  // Enter PiP when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && videoRef.current && !isInPiP) {
        try {
          await videoRef.current.requestPictureInPicture();
        } catch (error) {
          // PiP requires user gesture - this is expected when triggered by visibility change
          // User can manually enter PiP using the button
          console.error('Failed to enter PiP:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInPiP]);

  // Handle clicks in PiP window
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Get click coordinates relative to the video element
      // In PiP mode, getBoundingClientRect() returns the PiP window's position
      const rect = video.getBoundingClientRect();
      
      // Calculate scale factors to convert screen coordinates to canvas coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Convert click coordinates to canvas coordinates
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Check which button was clicked
      for (const button of buttonAreasRef.current) {
        if (
          x >= button.x &&
          x <= button.x + button.width &&
          y >= button.y &&
          y <= button.y + button.height
        ) {
          // Visual feedback: briefly highlight the button
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const originalFill = ctx.fillStyle;
            ctx.fillStyle = button.action === 'distraction' ? '#404040' : '#dc262650';
            ctx.fillRect(button.x, button.y, button.width, button.height);
            
            // Redraw button after highlight
            setTimeout(() => {
              if (ctx && canvas) {
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(button.x, button.y, button.width, button.height);
                ctx.strokeStyle = button.action === 'distraction' ? '#404040' : '#dc2626';
                ctx.strokeRect(button.x, button.y, button.width, button.height);
                
                // Redraw text
                ctx.fillStyle = button.action === 'distraction' ? '#ededed' : '#dc2626';
                ctx.font = '12px sans-serif';
                if (button.action === 'distraction') {
                  ctx.fillText(`D (${distractionCount})`, button.x + 10, button.y + 20);
                } else {
                  ctx.fillText('A', button.x + 10, button.y + 20);
                }
              }
            }, 150);
          }

          if (button.action === 'distraction') {
            onLogDistraction();
          } else if (button.action === 'abandon') {
            onAbandon();
          }
          break;
        }
      }
    };

    // Add click listener with capture phase to ensure it fires
    video.addEventListener('click', handleClick, true);
    video.style.pointerEvents = 'auto';
    video.style.cursor = 'pointer';

    return () => {
      video.removeEventListener('click', handleClick, true);
    };
  }, [isInPiP, onLogDistraction, onAbandon, distractionCount]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={240}
        height={160}
        style={{ display: 'none' }}
      />
      <video
        ref={videoRef}
        style={{ display: 'none', pointerEvents: 'auto', cursor: 'pointer' }}
        playsInline
        muted
        controls={false}
      />
      {!isInPiP && (
        <button
          onClick={async () => {
            if (videoRef.current) {
              try {
                await videoRef.current.requestPictureInPicture();
              } catch (error) {
                console.error('Failed to enter PiP:', error);
              }
            }
          }}
          className="fixed bottom-4 right-4 px-4 py-2 bg-foreground text-background rounded-lg text-sm hover:opacity-90 transition-opacity z-40"
        >
          Open PiP Window
        </button>
      )}
    </>
  );
}

