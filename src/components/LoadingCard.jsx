import './LoadingCard.css';

const LoadingCard = ({ type = 'product' }) => {
  if (type === 'product') {
    return (
      <div className="loading-card">
        <div className="loading-card-image shimmer"></div>
        <div className="loading-card-content">
          <div className="loading-card-line shimmer" style={{ width: '60%' }}></div>
          <div className="loading-card-line shimmer" style={{ width: '40%' }}></div>
          <div className="loading-card-line shimmer" style={{ width: '30%', marginTop: '1rem' }}></div>
        </div>
      </div>
    );
  }

  if (type === 'category') {
    return (
      <div className="loading-card loading-card-category">
        <div className="loading-card-image shimmer" style={{ height: '300px' }}></div>
        <div className="loading-card-content">
          <div className="loading-card-line shimmer" style={{ width: '50%' }}></div>
        </div>
      </div>
    );
  }

  if (type === 'featured') {
    return (
      <div className="loading-card loading-card-featured">
        <div className="loading-card-image shimmer" style={{ height: '500px' }}></div>
        <div className="loading-card-content">
          <div className="loading-card-line shimmer" style={{ width: '70%' }}></div>
          <div className="loading-card-line shimmer" style={{ width: '50%' }}></div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingCard;
