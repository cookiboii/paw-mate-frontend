import React, { useState, useEffect, useRef, useMemo, ChangeEvent, FormEvent, DragEvent, MouseEvent } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { fetchAnimalList, registerAnimal, updateAnimalStatus, deleteAnimal } from '../../api/animal';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/AdminAnimalsPage.module.css';
import { useToast } from '../../context/ToastContext';
import FloatingInput from '../../components/FloatingInput';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ImageWithFallback from '../../components/ImageWithFallback';
import { SPECIES_OPTIONS, STATUS_OPTIONS, GENDER_OPTIONS, getGenderLabel, getSpeciesLabel, getStatusLabel } from '../../constants/animal';
import usePageTitle from '../../hooks/usePageTitle';
import { uploadImageToBlob } from '../../utils/imageUpload';
import { Animal, AnimalRegisterForm } from '../../types/animal';
import {
  PawPrint,
  PlusCircle,
  Search,
  Trash2,
  ExternalLink,
  Camera,
  X,
  RotateCcw,
  CheckCircle2,
  Filter
} from 'lucide-react';

const AdminAnimalsPage: React.FC = () => {
  usePageTitle('보호 동물 통합 관리 (Admin)');
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'register' ? 'register' : 'list';
  const setActiveTab = (tab: 'list' | 'register') => {
    setSearchParams({ tab });
  };

  // --- 1. 동물 목록 관리 상태 ---
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');

  // 삭제 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // --- 2. 신규 등록 폼 상태 ---
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [animalForm, setAnimalForm] = useState<AnimalRegisterForm>({
    species: '',
    breed: '',
    color: '',
    status: 'PROTECTED',
    gender: 'MALE',
    age: '',
    image: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role?.toUpperCase() !== 'ADMIN' && user?.role?.toUpperCase() !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 동물 목록 로딩
  const loadAnimals = async () => {
    setIsLoadingList(true);
    try {
      const data = await fetchAnimalList(0, 100);
      const list =
        'result' in data && data.result
          ? data.result.content || []
          : 'content' in data
          ? data.content || []
          : [];
      setAnimals(list as Animal[]);
    } catch (err) {
      console.error('동물 목록 로드 실패:', err);
      showToast('동물 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      loadAnimals();
    }
  }, [activeTab]);

  // 목록 필터링
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // 1. 상태 필터
      if (statusFilter !== 'ALL' && (animal.status || '').toUpperCase() !== statusFilter) {
        return false;
      }
      // 2. 종 필터
      if (speciesFilter !== 'ALL' && (animal.species || '').toUpperCase() !== speciesFilter) {
        return false;
      }
      // 3. 검색어 필터 (품종, 종, 색상)
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase().trim();
        const breed = (animal.breed || '').toLowerCase();
        const species = (animal.species || '').toLowerCase();
        const color = (animal.color || '').toLowerCase();
        if (!breed.includes(q) && !species.includes(q) && !color.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [animals, statusFilter, speciesFilter, searchKeyword]);

  // 상태 빠른 변경 핸들러
  const handleQuickStatusChange = async (animalId: number | string, newStatus: string) => {
    try {
      // 낙관적 UI 업데이트
      setAnimals((prev) =>
        prev.map((a) => (a.id === animalId ? { ...a, status: newStatus } : a))
      );

      await updateAnimalStatus(animalId, newStatus);
      showToast(`동물(#${animalId})의 보호 상태가 '${getStatusLabel(newStatus)}'(으)로 변경되었습니다.`, 'success');
    } catch (err) {
      console.error('상태 변경 실패:', err);
      showToast('상태 변경에 실패했습니다.', 'error');
      loadAnimals(); // 롤백
    }
  };

  // 삭제 확인 실행
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsDeleting(true);
    try {
      await deleteAnimal(deleteTarget.id);
      showToast(`'${deleteTarget.breed || deleteTarget.species}' 정보가 성공적으로 삭제되었습니다.`, 'success');
      setAnimals((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('삭제 실패:', err);
      showToast('동물 정보 삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 등록 폼 핸들러 ---
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
      if (value === '') {
        setAnimalForm((prev) => ({ ...prev, age: '' }));
      } else {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setAnimalForm((prev) => ({ ...prev, age: parsed }));
        }
      }
      return;
    }
    setAnimalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const removeImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedFile(null);
    setAnimalForm((prev) => ({ ...prev, image: '' }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const ageNum = typeof animalForm.age === 'number' ? animalForm.age : parseInt(animalForm.age, 10);
    if (isNaN(ageNum) || ageNum < 0) {
      showToast('나이는 0 이상의 숫자로 입력해주세요.', 'error');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let uploadedImageUrl = animalForm.image;
      if (selectedFile) {
        uploadedImageUrl = await uploadImageToBlob(selectedFile);
      }

      await registerAnimal({ ...animalForm, image: uploadedImageUrl, age: ageNum });
      showToast('동물이 성공적으로 등록되었습니다!', 'success');

      // 폼 초기화 및 목록 탭으로 자동 이동
      setAnimalForm({
        species: '',
        breed: '',
        color: '',
        status: 'PROTECTED',
        gender: 'MALE',
        age: '',
        image: '',
      });
      setSelectedFile(null);
      setPreview(null);
      setActiveTab('list');
    } catch (err) {
      console.error('동물 등록 실패:', err);
      showToast('동물 등록에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>보호 동물 통합 관리</h2>
        <p className={styles.subtitle}>
          등록된 보호 동물 목록을 실시간으로 관리하고 새 보호 동물을 등록합니다.
        </p>
      </div>

      {/* 탭 네비게이션: [🐾 보호 동물 관리 목록] vs [➕ 신규 동물 등록] */}
      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'list' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <PawPrint size={16} />
          <span>보호 동물 관리 목록 ({animals.length})</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'register' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <PlusCircle size={16} />
          <span>신규 보호 동물 등록</span>
        </button>
      </div>

      {/* ---------------- 1. 목록 관리 탭 ---------------- */}
      {activeTab === 'list' && (
        <>
          {/* 검색 및 필터 컨트롤 바 */}
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <Search size={16} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="품종, 색상 등으로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div className={styles.filterChips}>
              {/* 보호 상태 필터 */}
              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">전체 상태</option>
                <option value="PROTECTED">보호중</option>
                <option value="WAITING">대기중</option>
                <option value="ADOPTED">입양완료</option>
              </select>

              {/* 종 필터 */}
              <select
                className={styles.filterSelect}
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
              >
                <option value="ALL">전체 종</option>
                <option value="DOG">강아지</option>
                <option value="CAT">고양이</option>
                <option value="ETC">기타</option>
              </select>

              {(searchKeyword || statusFilter !== 'ALL' || speciesFilter !== 'ALL') && (
                <button
                  className={styles.iconBtn}
                  onClick={() => {
                    setSearchKeyword('');
                    setStatusFilter('ALL');
                    setSpeciesFilter('ALL');
                  }}
                  title="필터 초기화"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>

          {/* 동물 목록 테이블 */}
          <div className={styles.tableCard}>
            {isLoadingList ? (
              <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                <Spinner />
              </div>
            ) : filteredAnimals.length === 0 ? (
              <div style={{ padding: '40px' }}>
                <EmptyState
                  icon={<PawPrint size={48} color="var(--text-muted)" />}
                  title="조건에 맞는 보호 동물이 없습니다."
                  description="검색어나 필터 조건을 변경해 보세요."
                  actionLabel="신규 동물 등록하기"
                  onAction={() => setActiveTab('register')}
                />
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>동물 정보</th>
                      <th>종 / 성별 / 나이</th>
                      <th>색상</th>
                      <th>보호 상태 (원클릭 변경)</th>
                      <th style={{ textAlign: 'right' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnimals.map((animal) => {
                      const animalId = animal.id ?? animal.animalId;
                      const statusKey = (animal.status || 'PROTECTED').toUpperCase();
                      const statusClass =
                        statusKey === 'PROTECTED'
                          ? styles.statusProtected
                          : statusKey === 'WAITING'
                          ? styles.statusWaiting
                          : styles.statusAdopted;

                      return (
                        <tr key={animalId}>
                          <td>
                            <div className={styles.animalCell}>
                              <img
                                src={animal.image || animal.profileImageUrl || animal.imageUrl || '/default-pet.png'}
                                alt={animal.breed || '반려동물'}
                                className={styles.thumbnail}
                              />
                              <div>
                                <span className={styles.animalBreed}>{animal.breed || animal.species || '이름 없음'}</span>
                                <span className={styles.animalMeta}>ID: #{animalId}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{getSpeciesLabel(animal.species)}</strong> • {getGenderLabel(animal.gender)}
                            </div>
                            <span className={styles.animalMeta}>{animal.age}살</span>
                          </td>
                          <td>{animal.color || '-'}</td>
                          <td>
                            <select
                              className={`${styles.statusSelect} ${statusClass}`}
                              value={statusKey}
                              onChange={(e) => animalId && handleQuickStatusChange(animalId, e.target.value)}
                            >
                              <option value="PROTECTED">🟢 보호중</option>
                              <option value="WAITING">🟡 대기중</option>
                              <option value="ADOPTED">🟣 입양완료</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className={styles.actionCell} style={{ justifyContent: 'flex-end' }}>
                              <Link
                                to={`/animals/${animalId}`}
                                className={styles.iconBtn}
                                title="일반 상세 페이지 보기"
                              >
                                <ExternalLink size={16} />
                              </Link>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                onClick={() => setDeleteTarget(animal)}
                                title="동물 삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------------- 2. 신규 등록 탭 ---------------- */}
      {activeTab === 'register' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className={styles.formCard}>
            <form onSubmit={handleRegisterSubmit} className={styles.formContent}>
              <div className={styles.formLayout}>
                {/* 텍스트 입력 영역 */}
                <div className={styles.inputSection}>
                  <FloatingInput
                    label="축종 (예: 강아지, 고양이, 기타)"
                    type="text"
                    name="species"
                    value={animalForm.species}
                    onChange={handleFormChange}
                    required
                  />

                  <FloatingInput
                    label="품종 (예: 골든 리트리버, 코리안 숏헤어)"
                    type="text"
                    name="breed"
                    value={animalForm.breed}
                    onChange={handleFormChange}
                    required
                  />

                  <div className={styles.gridRow}>
                    <FloatingInput
                      label="색상 (예: 크림색, 검정)"
                      type="text"
                      name="color"
                      value={animalForm.color}
                      onChange={handleFormChange}
                      required
                    />

                    <FloatingInput
                      label="나이 (살)"
                      type="number"
                      name="age"
                      value={animalForm.age}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className={styles.gridRow}>
                    <div className={styles.selectGroup}>
                      <label className={styles.selectLabel}>성별</label>
                      <select
                        name="gender"
                        value={animalForm.gender}
                        onChange={handleFormChange}
                        className={styles.select}
                        required
                      >
                        <option value="" disabled>성별 선택</option>
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.selectGroup}>
                      <label className={styles.selectLabel}>보호 상태</label>
                      <select
                        name="status"
                        value={animalForm.status}
                        onChange={handleFormChange}
                        className={styles.select}
                        required
                      >
                        <option value="" disabled>상태 선택</option>
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 이미지 업로드 영역 */}
                <div className={styles.uploadSection}>
                  <label className={styles.uploadLabel}>동물 대표 사진</label>
                  <div
                    className={`${styles.uploadBox} ${preview ? styles.hasPreview : ''} ${
                      isDragging ? styles.dragging : ''
                    }`}
                    onClick={() => !preview && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    {preview ? (
                      <div className={styles.previewContainer}>
                        <img src={preview} alt="미리보기" className={styles.previewImage} />
                        <button type="button" className={styles.removeBtn} onClick={removeImage} title="사진 제거">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <div className={styles.uploadIcon}>
                          <Camera size={36} />
                        </div>
                        <p>
                          클릭하여 사진을 선택하거나<br />
                          여기로 이미지를 드래그하세요
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.formFooter}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '등록 처리 중...' : '신규 동물 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="보호 동물 정보 삭제"
        message={`'${deleteTarget?.breed || deleteTarget?.species}' (#${deleteTarget?.id}) 정보를 정말로 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`}
        confirmText={isDeleting ? '삭제 중...' : '삭제하기'}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};


export default AdminAnimalsPage;
