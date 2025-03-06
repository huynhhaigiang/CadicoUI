import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { FaChevronDown, FaHardHat, FaRegBuilding } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { get } from '../api/axiosClient'

const ProjectManagementStackDT = () => {
  const [constructions, setConstructions] = useState([])
  const [selectedConstruction, setSelectedConstruction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchConstructions = async () => {
      try {
        const response = await get(
          '/CongTrinh/all-construction-with-project-by-approverId',
        )
        setConstructions(response.data)
      } catch (err) {
        setError('Không thể tải danh sách công trình')
      } finally {
        setLoading(false)
      }
    }
    fetchConstructions()
  }, [])

  const handleSelectConstruction = async constructionId => {
    try {
      setLoading(true)
      const response = await get(`/CongTrinh/${constructionId}/projects`)
      setSelectedConstruction(response.data)
    } catch (err) {
      setError('Không thể tải phương án thi công')
    } finally {
      setLoading(false)
    }
  }

  const renderSkeleton = (count = 3, height = 80) =>
    Array(count)
      .fill()
      .map((_, i) => (
        <div key={i} className='p-4 rounded-lg bg-white shadow-sm'>
          <Skeleton height={height} />
        </div>
      ))

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <FaRegBuilding className='text-blue-600' />
            Quản lý công trình
          </h1>
        </div>

        {/* Construction List */}
        <div className='bg-white rounded-xl shadow-sm'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold flex items-center gap-2'>
                <FaHardHat className='text-orange-500' />
                Danh sách công trình
              </h2>
              <span className='text-sm text-gray-500'>
                {constructions.length} công trình
              </span>
            </div>

            <div className='space-y-3'>
              {loading
                ? renderSkeleton(5, 72)
                : constructions.map(construction => (
                    <div
                      key={construction.id}
                      className='bg-white rounded-lg shadow-sm overflow-hidden'
                    >
                      <div
                        className={`p-4 cursor-pointer transition-all
                                                ${
                                                  selectedConstruction?.id ===
                                                  construction.id
                                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                                    : 'hover:bg-gray-50'
                                                }`}
                        onClick={() =>
                          handleSelectConstruction(construction.id)
                        }
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-medium text-gray-900'>
                              {construction.code}
                            </div>
                            <div className='text-sm text-gray-500 mt-1'>
                              {construction.name}
                            </div>
                          </div>
                          <FaChevronDown
                            className={`transform transition-transform ${
                              selectedConstruction?.id === construction.id
                                ? 'rotate-180 text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedConstruction?.id === construction.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className='overflow-hidden'
                          >
                            <div className='border-t border-gray-100 p-4 bg-gray-50'>
                              {error && (
                                <div className='mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200'>
                                  {error}
                                </div>
                              )}

                              <div className='space-y-3'>
                                {loading
                                  ? renderSkeleton(3, 72)
                                  : selectedConstruction.dsPhuongAnThiCong?.map(
                                      plan => (
                                        <div
                                          key={plan.id}
                                          onClick={() =>
                                            navigate(
                                              `/taskassignmentTP/${plan.id}`,
                                            )
                                          }
                                          className='group p-4 border border-gray-200 rounded-lg cursor-pointer transition-all
                                                                            hover:border-blue-200 hover:bg-blue-50'
                                        >
                                          <div className='flex items-center justify-between'>
                                            <div>
                                              <div className='font-medium text-gray-900'>
                                                {plan.code} - {plan.name}
                                              </div>
                                              <div className='text-sm text-gray-500 mt-1'>
                                                <span className='inline-block min-w-[120px]'>
                                                  {new Date(
                                                    plan.batDauThiCong,
                                                  ).toLocaleDateString()}{' '}
                                                  →
                                                </span>
                                                <span className='ml-2'>
                                                  {new Date(
                                                    plan.ketThucThiCong,
                                                  ).toLocaleDateString()}
                                                </span>
                                                <span className='ml-3 px-2 py-1 bg-gray-100 rounded-full text-xs'>
                                                  {
                                                    plan.thoiGianThiCongTheoHopDong
                                                  }{' '}
                                                  ngày
                                                </span>
                                              </div>
                                            </div>
                                            <FaChevronDown className='text-gray-400 group-hover:text-blue-600 transition-colors' />
                                          </div>
                                        </div>
                                      ),
                                    )}
                              </div>

                              {!loading &&
                                selectedConstruction.dsPhuongAnThiCong
                                  ?.length === 0 && (
                                  <div className='p-6 text-center text-gray-500'>
                                    <img
                                      src='/empty-state.svg'
                                      alt='No plans'
                                      className='mx-auto h-32 mb-4 opacity-75'
                                    />
                                    Chưa có phương án thi công nào
                                  </div>
                                )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectManagementStackDT
