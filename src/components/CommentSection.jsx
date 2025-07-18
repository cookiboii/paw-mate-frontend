import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import styles from '../styles/CommentSection.module.css';
import Spinner from '../components/Spinner';

const CommentSection = ({ postId }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [contentMap, setContentMap] = useState({});
  const [editModeMap, setEditModeMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, commentsRes] = await Promise.all([
          axios.get('/adoptmate/myInfo'),
          axios.get(`/comment/${postId}`)
        ]);

        setUserInfo({
          email: (userRes.data.email || '').trim().toLowerCase(),
          role: (userRes.data.role || '').toUpperCase()
        });
        setComments(commentsRes.data.result || []);
      } catch (err) {
        console.error('초기 데이터 로딩 실패:', err);
      }
    };

    fetchInitialData();
  }, [postId]);

  const handleChange = (id, value) => {
    setContentMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const key = parentId || 'root';
    const content = contentMap[key];
    if (!content?.trim()) return;

    setLoadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      await axios.post(`/comment/${postId}`, { content, parentId });
      setContentMap((prev) => ({ ...prev, [key]: '' }));
      const { data } = await axios.get(`/comment/${postId}`);
      setComments(data.result || []);
    } catch (err) {
      console.error('댓글 등록 실패:', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setLoadingMap((prev) => ({ ...prev, [commentId]: true }));

    try {
      await axios.delete(`/comment/${commentId}`);
      const { data } = await axios.get(`/comment/${postId}`);
      setComments(data.result || []);
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleEditToggle = (commentId, content) => {
    setEditModeMap((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    setContentMap((prev) => ({ ...prev, [commentId]: content }));
  };

  const handleUpdate = async (commentId) => {
    const updatedContent = contentMap[commentId];
    if (!updatedContent?.trim()) return;

    setLoadingMap((prev) => ({ ...prev, [commentId]: true }));

    try {
      await axios.put(`/comment/update/${commentId}`, { content: updatedContent });
      setEditModeMap((prev) => ({ ...prev, [commentId]: false }));
      const { data } = await axios.get(`/comment/${postId}`);
      setComments(data.result || []);
    } catch (err) {
      console.error('댓글 수정 실패:', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const renderComments = (commentList) =>
    commentList.map((comment) => {
      const isAuthor = userInfo?.email === comment.authorEmail;
      const isAdmin = userInfo?.role === 'ADMIN';

      return (
        <div key={comment.id} className={styles.commentBox}>
          <div className={styles.commentContent}>
            <strong>{comment.authorName}</strong>:<br />
            {loadingMap[comment.id] ? (
              <Spinner />
            ) : editModeMap[comment.id] ? (
              <>
                <input
                  type="text"
                  value={contentMap[comment.id] || ''}
                  onChange={(e) => handleChange(comment.id, e.target.value)}
                />
                <button onClick={() => handleUpdate(comment.id)}>저장</button>
                <button onClick={() => handleEditToggle(comment.id, '')}>취소</button>
              </>
            ) : (
              <>
                <span>{comment.content}</span>
                {(isAuthor || isAdmin) && (
                  <div className={styles.actions}>
                    {isAuthor && (
                      <button onClick={() => handleEditToggle(comment.id, comment.content)}>수정</button>
                    )}
                    <button onClick={() => handleDelete(comment.id)}>삭제</button>
                  </div>
                )}
              </>
            )}
          </div>

          {userInfo && (
            <form className={styles.replyForm} onSubmit={(e) => handleSubmit(e, comment.id)}>
              <input
                type="text"
                placeholder="답글 입력..."
                value={contentMap[comment.id] || ''}
                onChange={(e) => handleChange(comment.id, e.target.value)}
              />
              {loadingMap[comment.id] ? <Spinner /> : <button type="submit">등록</button>}
            </form>
          )}

          {comment.children && comment.children.length > 0 && (
            <div className={styles.childComments}>{renderComments(comment.children)}</div>
          )}
        </div>
      );
    });

  return (
    <div className={styles.commentSection}>
      <h3>댓글</h3>
      {userInfo && (
        <form onSubmit={(e) => handleSubmit(e)} className={styles.commentForm}>
          <input
            type="text"
            placeholder="댓글을 입력하세요"
            value={contentMap['root'] || ''}
            onChange={(e) => handleChange('root', e.target.value)}
          />
          {loadingMap['root'] ? <Spinner /> : <button type="submit">등록</button>}
        </form>
      )}
      <div className={styles.commentList}>{renderComments(comments)}</div>
    </div>
  );
};

export default CommentSection;
