import { useEffect, useMemo, useState } from 'react'
import {
  FaDownload,
  FaEdit,
  FaEye,
  FaPaperPlane,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'
import DownloadButton from '../components/DownloadButton'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bản nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  3: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  4: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const SupplyPage = () => {
  const { id } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [diaDiem, setDiaDiem] = useState('')
  const [noiDung, setNoiDung] = useState('')
  const [supplies, setSupplies] = useState([])
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deXuatVatTuList, setDeXuatVatTuList] = useState([])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedSupplyId, setSelectedSupplyId] = useState(null)
  const [selectedApproverId, setSelectedApproverId] = useState(null)
  const [approvers, setApprovers] = useState([])
  const [chiTietCungUng, setChiTietCungUng] = useState({
    soLuong: 0,
    donGia: 0,
    thanhTien: 0,
    vat: 0,
    thanhTienVAT: 0,
    nhaCungCap: '',
    ghiChu: '',
    deXuatVatTuId: null,
  })
  const [chiTietCungUngList, setChiTietCungUngList] = useState([])
  const [editingChiTietIndex, setEditingChiTietIndex] = useState(-1)
  const [vatRate, setVatRate] = useState(10)
  const [luyKe, setLuyKe] = useState(0)
  const [pendingVatTuPhu, setPendingVatTuPhu] = useState([])

  useEffect(() => {
    fetchSupplies()
  }, [])

  const fetchSupplies = async () => {
    try {
      const response = await get(`/PhieuCungUngVatTu/dsphieucungung/patc/${id}`)
      setSupplies(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách phiếu cung ứng')
    }
  }

  const fetchDeXuatVatTu = async () => {
    try {
      const response = await get(`/DeXuatVatTu/dsdexuatvattukemvattuphu/${id}`)
      setDeXuatVatTuList(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách vật tư')
    }
  }
  const findDeXuatVatTuById = id => {
    // Tìm trong cả vật tư chính và phụ
    for (const main of deXuatVatTuList) {
      if (main.id === id) return main
      if (main.childDeXuatVatTu) {
        const found = main.childDeXuatVatTu.find(child => child.id === id)
        if (found) return found
      }
    }
    return null
  }

  const handleSubmitApproval = async () => {
    console.log(selectedApproverId)
    console.log(selectedSupplyId)
    try {
      await put('/PhieuCungUngVatTu/submit', {
        phieuCungUngId: selectedSupplyId,
        truongPhongCungUngId: selectedApproverId,
      })
      toast.success('Gửi phê duyệt thành công')
      setShowSubmitModal(false)
      fetchSupplies()
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Lỗi gửi phê duyệt'
      toast.error(errorMessage)
    }
  }

  const fetchApprovers = async () => {
    try {
      const response = await get('AppUser/material-supply')
      setApprovers(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách người phê duyệt')
    }
  }

  const calculateThanhTien = (soLuong, donGia, vatRate) => {
    const thanhTien = soLuong * donGia
    const vat = thanhTien * (vatRate / 100)
    return { thanhTien, vat, thanhTienVAT: thanhTien + vat }
  }

  const handleQuantityChange = newVal => {
    const calculations = calculateThanhTien(
      newVal,
      chiTietCungUng.donGia,
      vatRate,
    )
    setChiTietCungUng(prev => ({
      ...prev,
      soLuong: newVal,
      ...calculations,
    }))
  }

  const handlePriceChange = newVal => {
    const calculations = calculateThanhTien(
      chiTietCungUng.soLuong,
      newVal,
      vatRate,
    )
    setChiTietCungUng(prev => ({
      ...prev,
      donGia: newVal,
      ...calculations,
    }))
  }

  const handleVatRateChange = newVatRate => {
    const calculations = calculateThanhTien(
      chiTietCungUng.soLuong,
      chiTietCungUng.donGia,
      newVatRate,
    )
    setVatRate(newVatRate)
    setChiTietCungUng(prev => ({
      ...prev,
      ...calculations,
    }))
  }

  const handleAddOrUpdateChiTiet = () => {
    if (
      !chiTietCungUng.deXuatVatTuId ||
      !chiTietCungUng.soLuong ||
      !chiTietCungUng.donGia
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin vật tư')
      return
    }

    const newItem = {
      ...chiTietCungUng,
      thanhTien: Number(
        (chiTietCungUng.soLuong * chiTietCungUng.donGia).toFixed(2),
      ),
      vat: Number(
        (
          (chiTietCungUng.soLuong * chiTietCungUng.donGia * vatRate) /
          100
        ).toFixed(2),
      ),
      thanhTienVAT: Number(
        (
          chiTietCungUng.soLuong *
          chiTietCungUng.donGia *
          (1 + vatRate / 100)
        ).toFixed(2),
      ),
    }

    const newList = [...chiTietCungUngList]

    if (editingChiTietIndex > -1) {
      // Cập nhật item hiện tại (có thể là vật tư chính hoặc phụ)
      newList[editingChiTietIndex] = newItem

      // Chỉ tự động cập nhật vật tư phụ nếu đang cập nhật vật tư chính
      // và không phải đang chỉnh sửa vật tư phụ trực tiếp
      const material = findDeXuatVatTuById(chiTietCungUng.deXuatVatTuId)
      const isUpdatingMainMaterial = !material?.loaiVatTu?.isVatTuPhu

      if (isUpdatingMainMaterial && pendingVatTuPhu.length > 0) {
        // Cập nhật các vật tư phụ
        pendingVatTuPhu.forEach(phu => {
          const childSoLuong = Number(
            (chiTietCungUng.soLuong * phu.ratio).toFixed(4),
          )
          const childCalculations = calculateThanhTien(
            childSoLuong,
            phu.donGia,
            vatRate,
          )

          const childItem = {
            ...childCalculations,
            soLuong: childSoLuong,
            donGia: phu.donGia,
            nhaCungCap: chiTietCungUng.nhaCungCap,
            ghiChu: chiTietCungUng.ghiChu,
            deXuatVatTuId: phu.id,
          }

          // Tìm index của vật tư phụ trong danh sách nếu đã tồn tại
          const existingChildIndex = newList.findIndex(
            item => item.deXuatVatTuId === phu.id,
          )
          if (existingChildIndex > -1) {
            // Cập nhật vật tư phụ đã tồn tại
            newList[existingChildIndex] = childItem
          } else {
            // Thêm vật tư phụ mới
            newList.push(childItem)
          }
        })
      }
    } else {
      // Thêm vật tư chính mới
      newList.push(newItem)

      // Thêm vật tư phụ cho vật tư chính mới
      pendingVatTuPhu.forEach(phu => {
        const childSoLuong = Number(
          (chiTietCungUng.soLuong * phu.ratio).toFixed(4),
        )
        const childCalculations = calculateThanhTien(
          childSoLuong,
          phu.donGia,
          vatRate,
        )

        const childItem = {
          ...childCalculations,
          soLuong: childSoLuong,
          donGia: phu.donGia,
          nhaCungCap: chiTietCungUng.nhaCungCap,
          ghiChu: chiTietCungUng.ghiChu,
          deXuatVatTuId: phu.id,
        }

        // Kiểm tra xem vật tư phụ đã tồn tại chưa
        const existingChildIndex = newList.findIndex(
          item => item.deXuatVatTuId === phu.id,
        )
        if (existingChildIndex === -1) {
          newList.push(childItem)
        }
      })
    }

    setChiTietCungUngList(newList)
    resetChiTietForm()
    setPendingVatTuPhu([])
  }

  const handleEditChiTiet = index => {
    const editedItem = chiTietCungUngList[index]
    console.log('Đang edit chi tiết:', editedItem)

    const material = findDeXuatVatTuById(editedItem.deXuatVatTuId)

    // Bỏ đoạn check này:
    // if (material?.loaiVatTu?.isVatTuPhu) {
    //   toast.error('Không thể chỉnh sửa vật tư phụ trực tiếp')
    //   return
    // }

    // Set đầy đủ thông tin chi tiết
    setChiTietCungUng({
      soLuong: editedItem.soLuong || 0,
      donGia: editedItem.donGia || 0,
      thanhTien: editedItem.thanhTien || 0,
      vat: editedItem.vat || 0,
      thanhTienVAT: editedItem.thanhTienVAT || 0,
      nhaCungCap: editedItem.nhaCungCap || '',
      ghiChu: editedItem.ghiChu || '',
      deXuatVatTuId: editedItem.deXuatVatTuId,
    })

    // Set VAT rate dựa vào dữ liệu hiện có
    if (editedItem.thanhTien && editedItem.thanhTien > 0) {
      const calculatedVatRate = (editedItem.vat / editedItem.thanhTien) * 100
      setVatRate(Math.round(calculatedVatRate))
    }

    setEditingChiTietIndex(index)

    // Load lũy kế nếu cần
    if (editedItem.deXuatVatTuId) {
      get(`/ChiTietCungUng/luyke/${editedItem.deXuatVatTuId}`)
        .then(response => {
          setLuyKe(response.data.luyKe)
        })
        .catch(error => {
          console.error('Lỗi khi load lũy kế:', error)
          setLuyKe(0)
        })
    }
  }
  const handleDeleteChiTiet = index => {
    const itemToDelete = chiTietCungUngList[index]
    const material = findDeXuatVatTuById(itemToDelete.deXuatVatTuId)

    if (material?.loaiVatTu?.isVatTuPhu) {
      toast.error('Vui lòng xóa vật tư chính để xóa vật tư phụ liên quan')
      return
    }

    if (!window.confirm('Tất cả vật tư phụ liên quan sẽ bị xóa!')) return

    // Tìm vật tư chính trong danh sách deXuatVatTuList để lấy thông tin về các vật tư phụ liên quan
    const mainVatTu = deXuatVatTuList.find(
      item => item.id === itemToDelete.deXuatVatTuId,
    )

    // Tạo mảng chứa ID của vật tư phụ
    // Khi bạn xóa vật tư chính, đoạn code này sẽ tự động xóa cả vật tư phụ
    const childIds = mainVatTu?.childDeXuatVatTu?.map(child => child.id) || []
    const newList = chiTietCungUngList.filter(
      item =>
        item.deXuatVatTuId !== itemToDelete.deXuatVatTuId &&
        !childIds.includes(item.deXuatVatTuId),
    )

    setChiTietCungUngList(newList)
  }

  const resetChiTietForm = () => {
    setChiTietCungUng({
      soLuong: 0,
      donGia: 0,
      thanhTien: 0,
      vat: 0,
      thanhTienVAT: 0,
      nhaCungCap: '',
      ghiChu: '',
      deXuatVatTuId: null,
    })
    setEditingChiTietIndex(-1)
  }

  const handleNextStep = () => {
    if (!diaDiem || !noiDung) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    setCurrentStep(2)
    fetchDeXuatVatTu()
  }

  const handleSaveSupply = async () => {
    try {
      // Kiểm tra nếu danh sách chi tiết rỗng
      if (chiTietCungUngList.length === 0) {
        toast.error('Vui lòng thêm ít nhất một vật tư')
        return
      }

      if (editId) {
        // === CHẾ ĐỘ CẬP NHẬT ===
        // 1. Cập nhật thông tin phiếu
        await put(`/PhieuCungUngVatTu/${editId}`, {
          diaDiem,
          noiDung,
          phuongAnThiCongId: id,
        })

        // 2. Chuẩn hóa danh sách chi tiết
        const processedChiTietList = chiTietCungUngList.map(item => ({
          id: item.id, // Có thể undefined
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
          vat: item.vat,
          thanhTienVAT: item.thanhTienVAT,
          nhaCungCap: item.nhaCungCap || '',
          ghiChu: item.ghiChu || '',
          deXuatVatTuId: Number(item.deXuatVatTuId || item.deXuatVatTu?.id),
          phieuCungUngVatTuId: editId,
        }))

        if (
          processedChiTietList.some(
            item => !item.deXuatVatTuId || !item.phieuCungUngVatTuId,
          )
        ) {
          toast.error('Dữ liệu chi tiết không hợp lệ. Vui lòng kiểm tra lại.')
          return
        }

        // 3. Cập nhật từng item
        for (const item of processedChiTietList) {
          if (item.id) {
            await put(`/ChiTietCungUng/${item.id}`, item)
          } else {
            await post('/ChiTietCungUng', item)
          }
        }

        toast.success('Cập nhật phiếu thành công')
      } else {
        // === CHẾ ĐỘ TẠO MỚI ===
        const phieuResponse = await post('/PhieuCungUngVatTu', {
          diaDiem,
          noiDung,
          phuongAnThiCongId: id,
        })

        const chiTietPayload = chiTietCungUngList.map(item => ({
          ...item,
          deXuatVatTuId: Number(item.deXuatVatTuId || item.deXuatVatTu?.id),
          phieuCungUngVatTuId: phieuResponse.data.id,
        }))

        await post('/ChiTietCungUng/batch', chiTietPayload)

        toast.success('Tạo phiếu thành công')
      }

      // Reset form & reload
      fetchSupplies()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Lỗi khi lưu phiếu:', error)
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Lỗi khi lưu phiếu cung ứng'
      toast.error(errorMessage)
    }
  }

  const handleEdit = async supply => {
    setDiaDiem(supply.diaDiem)
    setNoiDung(supply.noiDung)
    setEditId(supply.id)

    try {
      await fetchDeXuatVatTu()
      const chiTietResponse = await get(
        `/ChiTietCungUng/phieucungung/${supply.id}`,
      )

      if (chiTietResponse.data?.length > 0) {
        const transformedData = chiTietResponse.data.map(item => ({
          id: item.id, // Thêm ID của chi tiết
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
          vat: item.vat,
          thanhTienVAT: item.thanhTienVAT,
          nhaCungCap: item.nhaCungCap || '',
          ghiChu: item.ghiChu || '',
          deXuatVatTuId: item.deXuatVatTu?.id || item.deXuatVatTuId,
        }))
        setChiTietCungUngList(transformedData)
      }
      setShowModal(true)
      setCurrentStep(1)
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu')
    }
  }
  const loadChiTietForEdit = chiTietItem => {
    if (!chiTietItem) return

    console.log('Loading chi tiết để edit:', chiTietItem)

    // Tìm thông tin vật tư từ deXuatVatTuList
    const vatTu = deXuatVatTuList.find(
      item => item.id === chiTietItem.deXuatVatTuId,
    )

    // Set chi tiết cung ứng để hiển thị trong form
    setChiTietCungUng({
      soLuong: chiTietItem.soLuong || 0,
      donGia: chiTietItem.donGia || 0,
      thanhTien: chiTietItem.thanhTien || 0,
      vat: chiTietItem.vat || 0,
      thanhTienVAT: chiTietItem.thanhTienVAT || 0,
      nhaCungCap: chiTietItem.nhaCungCap || '',
      ghiChu: chiTietItem.ghiChu || '',
      deXuatVatTuId: chiTietItem.deXuatVatTu?.id,
    })

    // Load thông tin lũy kế nếu có
    if (chiTietItem.deXuatVatTuId) {
      get(`/ChiTietCungUng/luyke/${chiTietItem.deXuatVatTuId}`)
        .then(response => {
          setLuyKe(response.data.luyKe)
        })
        .catch(error => {
          console.error('Lỗi khi load lũy kế:', error)
          setLuyKe(0)
        })
    }

    // Xử lý vật tư phụ nếu có
    if (vatTu?.childDeXuatVatTu && vatTu.childDeXuatVatTu.length > 0) {
      const mainKlDeNghi = vatTu.klDeNghi || 1
      const updatedPhuList = vatTu.childDeXuatVatTu.map(phu => ({
        ...phu,
        ratio: phu.klDeNghi / mainKlDeNghi,
        donGia: phu.donGia || 0,
      }))
      setPendingVatTuPhu(updatedPhuList)
    } else {
      setPendingVatTuPhu([])
    }
  }
  const handleNextStepWithDataLoad = async () => {
    if (!diaDiem || !noiDung) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      // Load danh sách đề xuất vật tư
      await fetchDeXuatVatTu()

      // Chuyển sang bước 2
      setCurrentStep(2)

      // Nếu đang trong chế độ edit, đảm bảo chi tiết cung ứng được hiển thị
      if (editId && chiTietCungUngList.length > 0) {
        console.log(
          'Hiển thị lại chi tiết cung ứng khi chuyển step trong edit mode',
        )
      }
    } catch (error) {
      console.error('Lỗi khi load dữ liệu cho bước 2:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu vật tư')
    }
  }
  const handleDelete = async supplyId => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu này?')) {
      try {
        await del(`/PhieuCungUngVatTu/${supplyId}`)
        fetchSupplies()
        toast.success('Xóa phiếu thành công')
      } catch (error) {
        toast.error('Lỗi khi xóa phiếu cung ứng')
      }
    }
  }

  const resetForm = () => {
    setDiaDiem('')
    setNoiDung('')
    setEditId(null)
    setChiTietCungUngList([])
    resetChiTietForm()
    setCurrentStep(1)
    setPendingVatTuPhu([])
  }

  const filteredSupplies = useMemo(() => {
    return supplies.filter(
      supply =>
        supply.diaDiem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supply.noiDung.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [supplies, searchTerm])

  const navigate = useNavigate()

  const handleVatTuChange = async selectedId => {
    const selected = deXuatVatTuList.find(item => item.id === selectedId)
    setChiTietCungUng(prev => ({
      ...prev,
      deXuatVatTuId: selectedId,
      donGia: selected?.donGia || 0,
      soLuong: 0,
    }))

    // Lấy danh sách vật tư phụ
    if (selected?.childDeXuatVatTu?.length > 0) {
      const mainKlDeNghi = selected.klDeNghi || 1 // Tránh chia cho 0
      const updatedPhuList = selected.childDeXuatVatTu.map(phu => ({
        ...phu,
        ratio: phu.klDeNghi / mainKlDeNghi,
      }))
      setPendingVatTuPhu(updatedPhuList)
    } else {
      setPendingVatTuPhu([])
    }

    if (selectedId) {
      try {
        const response = await get(`/ChiTietCungUng/luyke/${selectedId}`)
        setLuyKe(response.data.luyKe)
      } catch (error) {
        toast.error('Lỗi tải lũy kế')
      }
    } else {
      setLuyKe(0)
    }
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
          <span className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm'>
            PA #{id}
          </span>
          Quản lý Cung ứng Vật tư
        </h1>
        <div className='flex gap-3 w-full sm:w-auto'>
          <div className='relative flex-1'>
            <input
              type='text'
              placeholder='Tìm kiếm phiếu...'
              className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <svg
              className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
          >
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gradient-to-r from-blue-600 to-blue-500 text-white'>
            <tr>
              {[
                'STT',
                'Mã phiếu',
                'Mã công trình',
                'Tên công trình',
                'Ngày tạo',
                'Trạng thái',
                'Thao tác',
              ].map((header, idx) => (
                <th
                  key={idx}
                  className={`p-4 text-left text-sm font-medium ${
                    idx === 0
                      ? 'rounded-tl-xl'
                      : idx === 6
                      ? 'rounded-tr-xl'
                      : ''
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {filteredSupplies.map((supply, index) => (
              <tr
                key={supply.id}
                className='hover:bg-gray-50 transition-all duration-200'
              >
                <td className='p-4 text-gray-700 font-medium'>{index + 1}</td>
                <td className='p-4 max-w-[300px]'>
                  <div className='font-medium text-gray-900 truncate'>
                    {supply.soPhieu}
                  </div>
                </td>
                <td className='p-4 max-w-[200px]'>
                  <div className='font-medium text-gray-900 truncate'>
                    {supply.congTrinh.code}
                  </div>
                </td>
                <td className='p-4 max-w-[300px]'>
                  <div className='text-gray-600 line-clamp-2'>
                    {supply.congTrinh.name}
                  </div>
                </td>
                <td className='p-4'>
                  <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                    {new Date(supply.createAt).toLocaleDateString('vi-VN')}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
                    ${
                      statusConfig[parseInt(supply.status)]?.color ||
                      'bg-gray-100'
                    }`}
                  >
                    {statusConfig[parseInt(supply.status)]?.label || 'N/A'}
                  </span>
                </td>
                <td className='p-4'>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => {
                        setSelectedSupplyId(supply.id)
                        setShowSubmitModal(true)
                        fetchApprovers()
                      }}
                      className='text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-all duration-200'
                      title='Gửi phê duyệt'
                    >
                      <FaPaperPlane size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/supply-detail/${supply.id}`)}
                      className='text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100'
                    >
                      <FaEye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(supply)}
                      className='text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200'
                      title='Chỉnh sửa'
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(supply.id)}
                      className='text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200'
                      title='Xóa'
                    >
                      <FaTrash size={18} />
                    </button>
                    <DownloadButton
                      duongdan={`/PhieuCungUngVatTu/export/${supply.id}`}
                    >
                      <FaDownload className='h-4 w-4 text-blue flex-shrink-0' />
                    </DownloadButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSupplies.length === 0 && (
          <div className='p-8 text-center text-gray-500 bg-gray-50'>
            Không tìm thấy phiếu cung ứng nào
          </div>
        )}
      </div>
      {/* Thêm phần hiển thị vật tư phụ trong modal */}
      {pendingVatTuPhu.length > 0 && (
        <div className='mt-4 bg-blue-50 p-4 rounded-lg'>
          <h4 className='font-semibold text-sm text-blue-800 mb-3'>
            Vật tư phụ sẽ được tự động thêm:
          </h4>
          {pendingVatTuPhu.map((phu, index) => {
            const mainVatTu = deXuatVatTuList.find(
              vt => vt.id === chiTietCungUng.deXuatVatTuId,
            )
            const ratioDisplay = mainVatTu
              ? `${phu.klDeNghi} / ${mainVatTu.klDeNghi}`
              : '0'
            const childSoLuong = chiTietCungUng.soLuong
              ? Number((chiTietCungUng.soLuong * phu.ratio).toFixed(4))
              : 0

            return (
              <div
                key={index}
                className='bg-white p-3 rounded border border-blue-100 mb-2'
              >
                <div className='grid grid-cols-4 gap-2 text-sm items-center'>
                  <div className='font-medium'>{phu.loaiVatTu.name}</div>
                  <div>
                    <span className='text-gray-500'>Tỷ lệ: </span>
                    {ratioDisplay}
                  </div>
                  <div>
                    <span className='text-gray-500'>Số lượng: </span>
                    {chiTietCungUng.soLuong || 0} × {phu.ratio.toFixed(2)} ={' '}
                    {childSoLuong}
                  </div>
                  <div>
                    <span className='text-gray-500'>Đơn giá: </span>
                    {phu.donGia.toLocaleString()} VND
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showSubmitModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl shadow-lg w-full max-w-md p-6'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Chọn người phê duyệt
            </h2>
            <select
              value={selectedApproverId ?? ''}
              onChange={e => setSelectedApproverId(Number(e.target.value))} // Chuyển đổi sang số nếu cần
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4'
            >
              <option value='' disabled>
                -- Chọn người phê duyệt --
              </option>{' '}
              {approvers.map(approver => (
                <option key={approver.id} value={approver.id}>
                  {approver.fullName}
                </option>
              ))}
            </select>
            <div className='flex justify-end mt-4'>
              <button
                onClick={handleSubmitApproval}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200'
              >
                Gửi phê duyệt
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg ml-2 hover:bg-gray-400 transition duration-200'
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-8xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-scale-up'>
            <div className='flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10'>
              <h2 className='text-xl font-semibold text-gray-900'>
                {editId ? 'Chỉnh sửa phiếu' : 'Thêm phiếu mới'}
                <span className='text-sm ml-2 text-gray-500'>
                  ({currentStep}/2)
                </span>
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className='text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200'
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {currentStep === 1 ? (
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Địa điểm <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={diaDiem}
                      onChange={e => setDiaDiem(e.target.value)}
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                      placeholder='Nhập địa điểm cung ứng...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nội dung <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      value={noiDung}
                      onChange={e => setNoiDung(e.target.value)}
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-32 resize-none shadow-sm transition-all duration-300'
                      placeholder='Nhập nội dung cung ứng...'
                    />
                  </div>
                </div>
              ) : (
                <div className='space-y-6'>
                  <div className='bg-blue-50 p-5 rounded-xl shadow-sm'>
                    <h3 className='text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide'>
                      Thông tin vật tư
                    </h3>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Chọn vật tư <span className='text-red-500'>*</span>
                        </label>
                        <select
                          className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm transition-all duration-300'
                          value={chiTietCungUng.deXuatVatTuId || ''}
                          onChange={e =>
                            handleVatTuChange(parseInt(e.target.value))
                          }
                        >
                          <option value=''>-- Chọn vật tư --</option>
                          {deXuatVatTuList.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.loaiVatTu?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {chiTietCungUng.deXuatVatTuId && (
                        <div className='bg-white p-4 rounded-lg border border-gray-100 shadow-sm'>
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                            {[
                              {
                                label: 'Quy cách',
                                value:
                                  deXuatVatTuList.find(
                                    item =>
                                      item.id === chiTietCungUng.deXuatVatTuId,
                                  )?.loaiVatTu.quyCach || 'N/A',
                              },
                              {
                                label: 'Xuất xứ',
                                value:
                                  deXuatVatTuList.find(
                                    item =>
                                      item.id === chiTietCungUng.deXuatVatTuId,
                                  )?.loaiVatTu.xuatXu || 'N/A',
                              },
                              {
                                label: 'ĐVT',
                                value:
                                  deXuatVatTuList.find(
                                    item =>
                                      item.id === chiTietCungUng.deXuatVatTuId,
                                  )?.loaiVatTu.dvt.name || 'N/A',
                              },
                              {
                                label: 'KL đề nghị',
                                value:
                                  deXuatVatTuList
                                    .find(
                                      item =>
                                        item.id ===
                                        chiTietCungUng.deXuatVatTuId,
                                    )
                                    ?.klDeNghi.toLocaleString() || '0',
                              },
                              {
                                label: 'Đơn giá',
                                value: `${
                                  deXuatVatTuList
                                    .find(
                                      item =>
                                        item.id ===
                                        chiTietCungUng.deXuatVatTuId,
                                    )
                                    ?.donGia.toLocaleString() || '0'
                                } VND`,
                              },
                              {
                                label: 'Thành tiền',
                                value: `${
                                  deXuatVatTuList
                                    .find(
                                      item =>
                                        item.id ===
                                        chiTietCungUng.deXuatVatTuId,
                                    )
                                    ?.thanhTien.toLocaleString() || '0'
                                } VND`,
                              },
                            ].map((info, idx) => (
                              <div key={idx}>
                                <div className='text-gray-500 font-medium'>
                                  {info.label}:
                                </div>
                                <div className='text-gray-900'>
                                  {info.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Số lượng <span className='text-red-500'>*</span>
                      </label>
                      <div className='flex items-center'>
                        <input
                          type='number'
                          className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                          value={chiTietCungUng.soLuong}
                          onChange={e =>
                            handleQuantityChange(parseFloat(e.target.value))
                          }
                        />
                      </div>
                      <span className='ml-3 text-base text-blue-500'>
                        Lũy kế: {luyKe}
                      </span>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Đơn giá (VND) <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                        value={chiTietCungUng.donGia}
                        onChange={e =>
                          handlePriceChange(parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Chọn VAT <span className='text-red-500'>*</span>
                    </label>
                    <select
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                      value={vatRate}
                      onChange={e =>
                        handleVatRateChange(parseInt(e.target.value))
                      }
                    >
                      <option value={0}>0%</option>
                      <option value={8}>8%</option>
                      <option value={10}>10%</option>
                    </select>
                  </div>

                  <div className='grid grid-cols-3 gap-5'>
                    {[
                      {
                        label: 'Thành tiền',
                        value: chiTietCungUng.thanhTien.toLocaleString() || '0',
                      },
                      {
                        label: 'VAT',
                        value: chiTietCungUng.vat.toLocaleString() || '0',
                      },
                      {
                        label: 'Thành tiền (có VAT)',
                        value:
                          chiTietCungUng.thanhTienVAT.toLocaleString() || '0',
                      },
                    ].map((field, idx) => (
                      <div key={idx}>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {field.label}
                        </label>
                        <input
                          type='text'
                          className='w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-medium'
                          value={field.value}
                          readOnly
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nhà cung cấp
                    </label>
                    <input
                      type='text'
                      value={chiTietCungUng.nhaCungCap}
                      onChange={e =>
                        setChiTietCungUng(prev => ({
                          ...prev,
                          nhaCungCap: e.target.value,
                        }))
                      }
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                      placeholder='Nhập tên nhà cung cấp...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Ghi chú
                    </label>
                    <textarea
                      value={chiTietCungUng.ghiChu}
                      onChange={e =>
                        setChiTietCungUng(prev => ({
                          ...prev,
                          ghiChu: e.target.value,
                        }))
                      }
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-24 resize-none shadow-sm transition-all duration-300'
                      placeholder='Nhập ghi chú nếu có...'
                    />
                  </div>

                  <div className='flex gap-3'>
                    <button
                      onClick={handleAddOrUpdateChiTiet}
                      className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
                    >
                      {editingChiTietIndex > -1 ? <FaSave /> : <FaPlus />}
                      {editingChiTietIndex > -1
                        ? 'Cập nhật vật tư'
                        : 'Thêm vật tư'}
                    </button>
                    {editingChiTietIndex > -1 && (
                      <button
                        onClick={resetChiTietForm}
                        className='bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-300'
                      >
                        <FaTimes /> Hủy
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Danh sách vật tư đã thêm
                    </h3>
                    <div className='overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100'>
                      <table className='w-full'>
                        <thead className='bg-gray-50'>
                          <tr>
                            {[
                              'Tên Vật tư',
                              'Số lượng',
                              'Đơn giá (chưa VAT)',
                              'Thành tiền (chưa VAT)',
                              'VAT',
                              'Thành tiền (có VAT)',
                              'Nhà cung cấp',
                              'Ghi chú',
                              'Thao tác',
                            ].map((header, idx) => (
                              <th
                                key={idx}
                                className='p-3 text-left text-sm font-semibold text-gray-700'
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                          {chiTietCungUngList.map((item, index) => {
                            const material = findDeXuatVatTuById(
                              item.deXuatVatTuId,
                            )
                            const isVatTuPhu = material?.loaiVatTu?.isVatTuPhu
                            return (
                              <tr
                                key={index}
                                className='hover:bg-gray-50 transition-all duration-200'
                              >
                                <td className='p-3'>
                                  {material?.loaiVatTu?.name || 'N/A'}
                                  {material?.loaiVatTu?.isVatTuPhu && (
                                    <span className='ml-2 text-xs text-gray-500'>
                                      (Vật tư phụ)
                                    </span>
                                  )}
                                </td>
                                <td className='p-3'>{item.soLuong}</td>
                                <td className='p-3'>
                                  {item.donGia.toLocaleString()} VND
                                </td>
                                <td className='p-3'>
                                  {item.thanhTien.toLocaleString()} VND
                                </td>
                                <td className='p-3'>
                                  {item.vat.toLocaleString()} VND
                                </td>
                                <td className='p-3'>
                                  {item.thanhTienVAT.toLocaleString()} VND
                                </td>
                                <td className='p-3'>{item.nhaCungCap}</td>
                                <td className='p-3'>{item.ghiChu}</td>
                                <td className='p-3 text-center'>
                                  <div className='flex justify-center gap-2'>
                                    <button
                                      className='text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200'
                                      onClick={() => handleEditChiTiet(index)}
                                      title='Chỉnh sửa'
                                    >
                                      <FaEdit size={18} />
                                    </button>
                                    <button
                                      className='text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200'
                                      onClick={() => handleDeleteChiTiet(index)}
                                      title='Xóa'
                                    >
                                      <FaTrash size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex justify-end mt-6'>
                <button
                  onClick={
                    currentStep === 1
                      ? handleNextStepWithDataLoad
                      : handleSaveSupply
                  }
                  className='bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
                >
                  {currentStep === 1
                    ? 'Tiếp theo'
                    : editId
                    ? 'Cập nhật'
                    : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplyPage
