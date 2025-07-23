import { ClipLoader } from 'react-spinners';

const Spinner = ({ message = '로딩 중입니다...' }) => {
  return (
    <div style={{
      height: 'calc(100vh - 80px)', // 헤더 높이만큼 빼기
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ClipLoader color="#4CAF50" size={50} />
      <p style={{ marginTop: 12, color: "#555" }}>{message}</p>
    </div>
  );
};

export default Spinner;