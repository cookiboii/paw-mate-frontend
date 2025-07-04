import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin/AdminLayout';
import axios from 'axios';


const AdminAnimalsPage = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editAnimalId, setEditAnimalId] = useState(null);

  const fetchAnimals = () => {
    setLoading(true);
    axios.get('/api/admin/animals')
      .then(res => {
        setAnimals(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('동물 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    axios.delete(`/api/admin/animals/${id}`)
      .then(() => {
        fetchAnimals();
      })
      .catch(() => {
        alert('삭제 실패');
      });
  };

  const handleEdit = (id) => {
    setEditAnimalId(id);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditAnimalId(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchAnimals();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <h1>🐶 동물 관리</h1>

      {showForm ? (
        <AnimalForm
          animalId={editAnimalId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <button onClick={handleAddNew}>동물 등록</button>

          {loading && <p>로딩 중...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>종류</th>
                  <th>성별</th>
                  <th>나이</th>
                  <th>상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {animals.map(animal => (
                  <tr key={animal.id}>
                    <td>{animal.id}</td>
                    <td>{animal.name}</td>
                    <td>{animal.species}</td>
                    <td>{animal.gender}</td>
                    <td>{animal.age}</td>
                    <td>{animal.status}</td>
                    <td>
                      <button onClick={() => handleEdit(animal.id)}>수정</button>
                      <button onClick={() => handleDelete(animal.id)} style={{ marginLeft: '8px' }}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAnimalsPage;
