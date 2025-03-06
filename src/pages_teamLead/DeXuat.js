import { FaArrowLeft, FaTimes } from 'react-icons/fa'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

const RecommendationPage = () => {
  const { phuongAnThiCongId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate(-1)}
              className='p-2 hover:bg-gray-100 rounded-lg'
            >
              <FaArrowLeft className='text-xl text-gray-600' />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                Phương án thi công
              </h1>
              {state?.construction && (
                <p className='text-gray-600 mt-1'>
                  {state.construction.code} - {state.construction.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/projectmanagement')}
            className='flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg'
          >
            <FaTimes className='text-lg' />
            <span className='font-medium'>Đóng</span>
          </button>
        </div>

        <div className='bg-white rounded-xl shadow-sm'>
          <nav className='flex border-b border-gray-200'>
            <NavLink
              to={`/projectmanagement/${phuongAnThiCongId}/cost`}
              className={({ isActive }) =>
                `px-6 py-4 font-medium ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`
              }
            >
              Chi phí thực hiện
            </NavLink>
            <NavLink
              to={`/projectmanagement/${phuongAnThiCongId}/othercost`}
              className={({ isActive }) =>
                `px-6 py-4 font-medium ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`
              }
            >
              Chi Phí Khác
            </NavLink>
            <NavLink
              to={`/projectmanagement/${phuongAnThiCongId}/material`}
              className={({ isActive }) =>
                `px-6 py-4 font-medium ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`
              }
            >
              Đề xuất Vật tư
            </NavLink>
          </nav>

          <div className='p-6'>
            <Outlet
              context={{
                construction: state?.construction,
                projectId: phuongAnThiCongId,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendationPage
