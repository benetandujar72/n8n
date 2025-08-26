import React from 'react';
import { useParams } from 'react-router-dom';

const CursDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Detall del Curs</h1>
      <p className="text-gray-600">Detall del curs amb ID: {id} (en construcció).</p>
    </div>
  );
};

export default CursDetailPage;
