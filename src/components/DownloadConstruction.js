import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { FaDownload } from 'react-icons/fa'
import DownloadButton from './DownloadButton'

/**
 * Reusable Download Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility of the modal
 * @param {Function} props.onClose - Function to call when modal closes
 * @param {Object} props.selectedItem - The item to download (construction or project)
 * @param {string} props.title - Modal title
 * @param {string} props.subtitle - Modal subtitle
 * @param {string} props.idParamName - Name of the ID parameter to use in URL (e.g., 'congTrinhId' or 'patcId')
 * @param {string} props.endpoint - API endpoint for download
 * @returns {JSX.Element}
 */
const DownloadConstruction = ({
  isOpen,
  onClose,
  selectedItem,
  title = 'Tải Xuống',
  subtitle = 'Chọn công ty để tải xuống tài liệu',
  idParamName = 'id',
  endpoint = '/download',
}) => {
  if (!isOpen || !selectedItem) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4'
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-lg w-full border border-gray-100 relative'
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-gray-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          <div className='text-center space-y-4'>
            <div className='mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg'>
              <FaDownload className='h-12 w-12 text-white transform -translate-y-0.5' />
            </div>
            <h3 className='text-3xl font-bold text-gray-900'>{title}</h3>
            <p className='text-gray-600 text-base font-medium'>{subtitle}</p>
          </div>

          {/* Download buttons */}
          <div className='mt-8 flex flex-col gap-5'>
            <div className='flex flex-col items-center space-y-2'>
              <DownloadButton
                duongdan={`${endpoint}?${idParamName}=${selectedItem.id}&companyName=CTYCADICO`}
                className='w-full py-4 bg-gradient-to-br from-blue-300 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center px-6 gap-3'
              >
                <FaDownload className='h-6 w-6 text-white flex-shrink-0' />
                <span>Tải File - CTY CP CADICO</span>
              </DownloadButton>
            </div>

            <div className='flex flex-col items-center space-y-2'>
              <DownloadButton
                duongdan={`${endpoint}?${idParamName}=${selectedItem.id}&companyName=CTYHHD`}
                className='w-full py-4 bg-gradient-to-br from-green-300 to-green-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center px-6 gap-3'
              >
                <FaDownload className='h-6 w-6 text-white flex-shrink-0' />
                <span>Tải File - CTY CP Hưng Hưng Đạt</span>
              </DownloadButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DownloadConstruction
