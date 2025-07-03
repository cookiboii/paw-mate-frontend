import React, { useState } from 'react';

const ReportLostAnimal = () => {
  const [form, setForm] = useState({
    species: '',
    breed: '',
    color: '',
    lostDate: '',
    location: '',
    note: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 백엔드 API 연동 예정
    console.log('제보 정보:', form);
    alert('잃어버린 동물 제보가 접수되었습니다!');
  };

  return (
    <section style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem' }}>
      <h2>잃어버린 동물 제보</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          동물 종류:
          <input type="text" name="species" value={form.species} onChange={handleChange} required />
        </label>
        <br />

        <label>
          품종:
          <input type="text" name="breed" value={form.breed} onChange={handleChange} required />
        </label>
        <br />

        <label>
          색상:
          <input type="text" name="color" value={form.color} onChange={handleChange} required />
        </label>
        <br />

        <label>
          잃어버린 날짜:
          <input type="date" name="lostDate" value={form.lostDate} onChange={handleChange} required />
        </label>
        <br />

        <label>
          잃어버린 위치:
          <input type="text" name="location" value={form.location} onChange={handleChange} required />
        </label>
        <br />

        <label>
          특이사항:
          <textarea name="note" value={form.note} onChange={handleChange} rows="3" />
        </label>
        <br />

        <label>
          이미지 업로드:
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
        </label>
        <br />

        <button type="submit">제보하기</button>
      </form>
    </section>
  );
};

export default ReportLostAnimal;
