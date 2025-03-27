import React, { useState } from 'react'
import { FaDownload } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import { downloadFile } from '../api/axiosClient'

const DownloadButton = ({ duongdan, className, children }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      const response = await downloadFile(duongdan)

      if (!response?.data) {
        toast.error('Không có dữ liệu')
        return
      }

      const url = window.URL.createObjectURL(response.data)
      const contentDisposition = response.headers['content-disposition']
      let fileName = 'document.docx'

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch) fileName = fileNameMatch[1]
      }

      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.detail || 'Lỗi tải file!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className={`${className} relative disabled:opacity-70 disabled:cursor-not-allowed`}
      onClick={handleDownload}
      disabled={isLoading}
      data-tooltip-id='download-tooltip'
    >
      {isLoading ? (
        <span className='animate-pulse'>Đang tải...</span>
      ) : (
        children || <FaDownload className='h-7 w-7 text-white flex-shrink-0' />
      )}

      <Tooltip
        id='download-tooltip'
        place='top'
        content='Tải tệp'
        className='z-[1000]'
      />
    </button>
  )
}

export default DownloadButton
