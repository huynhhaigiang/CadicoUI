import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { FaChevronDown, FaShippingFast } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { get } from '../api/axiosClient'

// const statusConfig = {
//   0: { color: 'bg-gray-100 text-gray-800', label: 'Chờ phê duyệt' },
//   1: { color: 'bg-amber-100 text-amber-800', label: 'Đã phê duyệt' },
//   2: { color: 'bg-green-100 text-green-800', label: 'Đang thi công' },
//   3: { color: 'bg-red-100 text-red-800', label: 'Đã hủy' },
// }

const SupplyManagementTP = () => {
  const navigate = useNavigate()
  const [state, setState] = useState({
    constructions: [],
    searchTerm: '',
    loading: false,
    error: null,
    expandedConstructionId: null,
  })

  useEffect(() => {
    fetchConstructions()
  }, [])

  const fetchConstructions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await get(
        '/CongTrinh/all-construction-with-project-approval',
      )
      console.log('API Response:', response.data) // Debug dữ liệu trả về
      setState(prev => ({ ...prev, constructions: response.data }))
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Lỗi tải danh sách công trình' }))
      setTimeout(() => setState(prev => ({ ...prev, error: null })), 5000)
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleConstructionClick = constructionId => {
    setState(prev => ({
      ...prev,
      expandedConstructionId:
        prev.expandedConstructionId === constructionId ? null : constructionId,
    }))
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Quản lý công trình</h1>
      {state.error && <div className='mb-4 text-red-600'>{state.error}</div>}
      {state.loading ? (
        <Skeleton count={5} height={50} />
      ) : (
        state.constructions.map(construction => (
          <div
            key={construction.id}
            className='bg-white rounded-lg shadow-sm mb-4 overflow-hidden'
          >
            <div
              className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                state.expandedConstructionId === construction.id
                  ? 'bg-blue-50'
                  : ''
              }`}
              onClick={() => handleConstructionClick(construction.id)}
            >
              <div>
                <div className='font-medium text-gray-900'>
                  {construction.code}
                </div>
                <div className='text-sm text-gray-500'>{construction.name}</div>
              </div>
              <FaChevronDown
                className={`transform transition-transform ${
                  state.expandedConstructionId === construction.id
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </div>

            <AnimatePresence>
              {state.expandedConstructionId === construction.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='overflow-hidden bg-gray-50'
                >
                  <div className='p-4'>
                    {construction.dsPhuongAnThiCong.length === 0 ? (
                      <p className='text-gray-500'>Không có phương án nào</p>
                    ) : (
                      <ul>
                        {construction.dsPhuongAnThiCong.map(pa => (
                          <li
                            key={pa.id}
                            className='flex justify-between items-center p-2 bg-white rounded-lg shadow-sm mb-2'
                          >
                            <span>
                              {pa.code} ({pa.name})
                            </span>
                            <span>
                              {pa.batDauThiCong} - {pa.ketThucThiCong}
                            </span>
                            <button
                              onClick={() => navigate(`/phuong-anTP/${pa.id}`)}
                              className='px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2'
                            >
                              <FaShippingFast className='text-sm' /> Cung ứng
                              vật tư
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))
      )}
    </div>
  )
}

export default SupplyManagementTP
