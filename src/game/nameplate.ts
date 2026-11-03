import * as THREE from 'three';

/**
 * Creates an exact 1:1 proportioned, High-DPI native 3D Billboard Sprite
 * for character overhead nickname tags.
 * Proportions dynamically match text width with zero horizontal stretching.
 */
export function createNameplateSprite(
  nickname: string,
  color: string,
  isSelf: boolean = false
): THREE.Sprite {
  const text = isSelf ? `${nickname} (나)` : nickname;

  // Measurement probe canvas
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  measureCtx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textMetrics = measureCtx.measureText(text);
  const textWidth = Math.ceil(textMetrics.width);

  // Compact layout dimensions
  const paddingX = 18;
  const dotRadius = 7.5;
  const dotSpacing = 11;
  const pillHeight = 42;
  const pillWidth = textWidth + dotRadius * 2 + dotSpacing + paddingX * 2;

  // Retina 2x scale for sharp text rendering
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(pillWidth * dpr);
  canvas.height = Math.ceil(pillHeight * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // Capsule background
  const radius = pillHeight / 2;
  ctx.beginPath();
  ctx.roundRect(1, 1, pillWidth - 2, pillHeight - 2, radius);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = isSelf ? 'rgba(96, 165, 250, 0.85)' : 'rgba(148, 163, 184, 0.55)';
  ctx.stroke();

  // Avatar color dot
  const dotX = paddingX + dotRadius;
  const dotY = pillHeight / 2;
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Nickname text
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(text, dotX + dotRadius + dotSpacing, dotY + 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);

  // Exact 1:1 physical world scale matching the texture aspect ratio
  const worldHeight = 0.26;
  const aspect = pillWidth / pillHeight;
  sprite.scale.set(worldHeight * aspect, worldHeight, 1);
  sprite.position.set(0, 2.05, 0); // Sits comfortably right above the head
  sprite.renderOrder = 999;

  return sprite;
}

/**
 * Creates an exact 1:1 proportioned floating 3D speech bubble Sprite.
 */
export function createSpeechBubbleSprite(text: string): THREE.Sprite {
  const displayText = text.length > 20 ? text.slice(0, 18) + '...' : text;

  // Measurement probe canvas
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  measureCtx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textMetrics = measureCtx.measureText(displayText);
  const textWidth = Math.ceil(textMetrics.width);

  const paddingX = 18;
  const bubbleHeight = 44;
  const tailHeight = 10;
  const totalHeight = bubbleHeight + tailHeight;
  const bubbleWidth = Math.max(90, textWidth + paddingX * 2);

  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(bubbleWidth * dpr);
  canvas.height = Math.ceil(totalHeight * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // Speech bubble rounded rect
  const radius = 12;
  ctx.beginPath();
  ctx.roundRect(1, 1, bubbleWidth - 2, bubbleHeight - 2, radius);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Speech tail pointing down
  const centerX = bubbleWidth / 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 7, bubbleHeight - 1);
  ctx.lineTo(centerX, totalHeight);
  ctx.lineTo(centerX + 7, bubbleHeight - 1);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Speech text
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayText, centerX, bubbleHeight / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);

  // Exact 1:1 physical world scale
  const worldHeight = 0.32;
  const aspect = bubbleWidth / totalHeight;
  sprite.scale.set(worldHeight * aspect, worldHeight, 1);
  sprite.position.set(0, 2.45, 0); // Positioned above the nameplate
  sprite.renderOrder = 1000;

  return sprite;
}
