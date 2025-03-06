import React, { useState } from 'react'
import { FaDownload } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import { downloadFile } from '../api/axiosClient'

const DownloadButton = ({ patcId }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsLoading(true)

      const response = await downloadFile(`/phuonganthicong/export/${patcId}`)
      if (!response || !response.data) {
        toast.error('Không có dữ liệu')
        return
      }

      // Tạo URL từ blob
      const url = window.URL.createObjectURL(response.data)

      // Lấy tên file (nếu có)
      const contentDisposition = response.headers['content-disposition']
      let fileName = 'document.docx'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch) {
          fileName = fileNameMatch[1]
        }
      }

      // Tải file
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Giải phóng URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.log(error)

      toast.error('Lỗi tải file!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      data-tooltip-id='download-tooltip'
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? 'Đang tải...' : <FaDownload />}
      <Tooltip id='download-tooltip' place='top' content='Tải tệp' />
    </button>
  )
}

export default DownloadButton
