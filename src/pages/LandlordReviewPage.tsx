import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const LandlordReviewPage = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`/api/landlords/${id}/reviews`)
      .then(res => res.json())
      .then(setReviews);
  }, [id]);

  return (
    <div>
      <h2>Landlord Reviews</h2>
      {reviews.map(r => (
        <div key={r.id}>
          <strong>{r.studentName}</strong>
          <p>{r.comment}</p>
          <span>Rating: {r.rating}</span>
        </div>
      ))}
    </div>
  );
};

export default LandlordReviewPage;