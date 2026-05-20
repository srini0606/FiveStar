// src/components/CustomCaptcha.jsx
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const generateCaptchaCode = (length = 5) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const CustomCaptcha = forwardRef(({ onValidate }, ref) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    validateCaptcha: () => {
      const isValid = userInput.trim().toUpperCase() === captchaCode;
      if (!isValid) regenerateCaptcha();
      return isValid;
    },
  }));

  const regenerateCaptcha = () => {
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    setUserInput('');
    renderCaptcha(newCode);
  };

  const renderCaptcha = (code) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 120;
    canvas.height = 40;

    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random()})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.font = '22px Arial';
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'middle';
    const spacing = canvas.width / (code.length + 1);
    [...code].forEach((char, i) => {
      const angle = (Math.random() - 0.5) * 0.5;
      ctx.save();
      ctx.translate(spacing * (i + 1), canvas.height / 2);
      ctx.rotate(angle);
      ctx.fillText(char, -6, 6);
      ctx.restore();
    });
  };

  useEffect(() => {
    regenerateCaptcha();
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">CAPTCHA</label>
      <div className="flex items-center gap-2">
        <canvas ref={canvasRef} className="border rounded" />
        <button
          type="button"
          onClick={regenerateCaptcha}
          className="text-xs px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value.toUpperCase())}
        className="mt-2 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none border-gray-300"
        placeholder="Enter CAPTCHA"
      />
    </div>
  );
});

export default CustomCaptcha;
