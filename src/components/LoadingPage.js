import React from 'react'

const LoadingPage = () => {
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-4'>
      <div className='flex flex-col items-center gap-8 animate-fadeIn'>
        {/* Logo Container với hiệu ứng ánh sáng động */}
        <div className='relative w-40 h-40 animate-float group'>
          {/* Hiệu ứng ánh sáng phản chiếu */}
          <div className='absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-xl animate-light-sweep' />

          {/* Glow effect */}
          <div className='absolute -inset-2 blur-xl bg-gradient-to-r from-blue-500/30 to-transparent rounded-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300' />

          <img
            src='/img/logocadico.jpg'
            alt='CADICO Logo'
            className='relative z-10 w-full h-full object-cover rounded-lg shadow-2xl transform transition-all duration-300 hover:scale-[1.02]'
          />
        </div>

        {/* Text với hiệu ứng gradient động */}
        <div className='space-y-6 text-center'>
          <h1 className='text-4xl font-bold'>
            <span className='bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent animate-gradient-pan'>
              CADICO
            </span>
          </h1>

          {/* Dot loader với hiệu ứng cascade */}
          <div className='flex justify-center space-x-2'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='w-3 h-3 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full animate-bounce'
                style={{
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: '0 0 12px -2px rgba(96, 165, 250, 0.5)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar với hiệu ứng chuyển động chất lỏng */}
        <div className='w-72 h-2.5 bg-slate-800 rounded-full overflow-hidden relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-progress-width opacity-80' />
          <div className='absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-liquid opacity-30 blur-[2px]' />
        </div>
      </div>

      <style jsx global>{`
        /* Animation keyframes */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotateZ(0deg);
          }
          50% {
            transform: translateY(-20px) rotateZ(3deg);
          }
        }

        @keyframes light-sweep {
          0% {
            transform: translateX(-100%) skewX(-20deg);
          }
          100% {
            transform: translateX(200%) skewX(-20deg);
          }
        }

        @keyframes gradient-pan {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes progress-width {
          0% {
            width: 0%;
            opacity: 1;
          }
          80% {
            width: 100%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }

        @keyframes liquid {
          0% {
            transform: translateX(-100%) skewX(-10deg);
          }
          100% {
            transform: translateX(100%) skewX(-10deg);
          }
        }

        /* Custom animation classes */
        .animate-fadeIn {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-light-sweep {
          animation: light-sweep 3s ease-in-out infinite;
        }

        .animate-gradient-pan {
          background-size: 200% 200%;
          animation: gradient-pan 4s linear infinite;
        }

        .animate-progress-width {
          animation: progress-width 2.5s cubic-bezier(0.77, 0, 0.18, 1) infinite;
        }

        .animate-liquid {
          animation: liquid 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1.2s infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingPage
